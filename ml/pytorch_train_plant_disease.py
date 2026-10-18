"""
=============================================================================
Plant Leaf Disease Classifier Training Pipeline (PyTorch)
Model Architecture: MobileNetV2 with Transfer Learning
Dataset: PlantVillage (54,303 leaf images across 38 crop-disease categories)
Target Deployment: ONNX, TorchScript, and Mobile Deployment
=============================================================================
"""

import os
import argparse
import time
import copy
import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim import lr_scheduler
from torchvision import datasets, models, transforms

# Hyperparameters
IMG_SIZE = 224
BATCH_SIZE = 32
NUM_EPOCHS = 20
LEARNING_RATE = 1e-4

def get_data_loaders(data_dir, batch_size=BATCH_SIZE):
    """
    Image augmentation pipeline simulating field and drone agricultural imagery
    """
    data_transforms = {
        'train': transforms.Compose([
            transforms.RandomResizedCrop(IMG_SIZE, scale=(0.8, 1.0)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomVerticalFlip(),
            transforms.RandomRotation(30),
            transforms.ColorJitter(brightness=0.2, contrast=0.2),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(IMG_SIZE),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    image_datasets = {
        x: datasets.ImageFolder(os.path.join(data_dir, x), data_transforms[x])
        for x in ['train', 'val']
    }
    
    dataloaders = {
        x: torch.utils.data.DataLoader(
            image_datasets[x], 
            batch_size=batch_size,
            shuffle=(x == 'train'), 
            num_workers=4,
            pin_memory=True
        )
        for x in ['train', 'val']
    }

    dataset_sizes = {x: len(image_datasets[x]) for x in ['train', 'val']}
    class_names = image_datasets['train'].classes

    return dataloaders, dataset_sizes, class_names


def build_mobilenet_v2(num_classes):
    """
    Loads MobileNetV2 with ImageNet pretrained weights and attaches custom classification head
    """
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)

    # Freeze base feature extractor initially
    for param in model.features.parameters():
        param.requires_grad = False

    # Replace classifier head
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes)
    )

    return model


def train_model(model, dataloaders, dataset_sizes, criterion, optimizer, scheduler, device, num_epochs=NUM_EPOCHS):
    since = time.time()
    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0

    for epoch in range(num_epochs):
        print(f"Epoch {epoch + 1}/{num_epochs}")
        print("-" * 10)

        # Unfreeze top feature layers after epoch 5 for fine-tuning
        if epoch == 5:
            print("[*] Unfreezing top layers of MobileNetV2 for fine-tuning...")
            for param in model.features[-4:].parameters():
                param.requires_grad = True

        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            if phase == 'train':
                scheduler.step()

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            print(f"{phase.capitalize()} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}")

            if phase == 'val' and epoch_acc > best_acc:
                best_acc = epoch_acc
                best_model_wts = copy.deepcopy(model.state_dict())

        print()

    time_elapsed = time.time() - since
    print(f"Training completed in {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s")
    print(f"Best Validation Accuracy: {best_acc:4f}")

    model.load_state_dict(best_model_wts)
    return model


def export_to_onnx(model, num_classes, output_path="plant_disease_mobilenetv2.onnx"):
    """
    Exports trained PyTorch model to ONNX for cross-platform deployment
    """
    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224, requires_grad=False)
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=12,
        do_constant_folding=True,
        input_names=['input_leaf_image'],
        output_names=['disease_probabilities'],
        dynamic_axes={'input_leaf_image': {0: 'batch_size'}, 'disease_probabilities': {0: 'batch_size'}}
    )
    print(f"[✓] Successfully exported ONNX model to {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train PyTorch Plant Leaf Disease Classifier")
    parser.add_argument("--data_dir", type=str, default="./plantvillage_dataset", help="Path to dataset root")
    parser.add_argument("--epochs", type=int, default=NUM_EPOCHS, help="Number of training epochs")
    parser.add_argument("--output", type=str, default="plant_disease_model.pth", help="Output model weights file")
    args = parser.parse_args()

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Using Compute Device: {device}")

    if os.path.exists(os.path.join(args.data_dir, 'train')):
        dataloaders, dataset_sizes, class_names = get_data_loaders(args.data_dir)
        num_classes = len(class_names)
        print(f"Detected {num_classes} disease classes: {class_names[:5]}...")

        model = build_mobilenet_v2(num_classes).to(device)
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=LEARNING_RATE)
        scheduler = lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)

        trained_model = train_model(model, dataloaders, dataset_sizes, criterion, optimizer, scheduler, device, args.epochs)
        torch.save(trained_model.state_dict(), args.output)
        print(f"[✓] Trained model saved to {args.output}")

        export_to_onnx(trained_model, num_classes, "plant_disease_mobilenetv2.onnx")
    else:
        print("[!] Dataset path not found. Please download PlantVillage and extract to ./plantvillage_dataset")
        print("Run with: python ml/pytorch_train_plant_disease.py --data_dir <path_to_data>")
