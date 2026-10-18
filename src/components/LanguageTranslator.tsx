import { useEffect } from 'react';

const LanguageTranslator = () => {
  useEffect(() => {
    if (!document.getElementById('google-translate-script')) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,hi,te,ta,kn,mr,bn,gu,ml,pa,ur,es,fr,de,zh-CN,ja,ru,ar,pt,it', 
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        }, 'google_translate_element');
      };

      const addScript = document.createElement('script');
      addScript.id = 'google-translate-script';
      addScript.setAttribute('src', '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
      
      document.body.appendChild(addScript);

      const style = document.createElement('style');
      style.id = 'google-translate-style';
      style.innerHTML = `
        .goog-te-banner-frame.skiptranslate { display: none !important; }
        body { top: 0px !important; }
        #goog-gt-tt { display: none !important; }
        .goog-tooltip skiptranslate { display: none !important; }
        .goog-tooltip:hover { display: none !important; }
        
        .goog-te-combo {
          padding: 8px 16px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background-color: rgba(20, 20, 20, 0.75);
          color: white;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.2s ease;
        }
        .goog-te-combo:hover {
          background-color: rgba(30, 30, 30, 0.9);
          border-color: rgba(255, 255, 255, 0.4);
        }
        .goog-te-combo option {
          background-color: #1a1a1a;
          color: white;
          padding: 8px;
        }
        
        .goog-te-gadget {
          font-family: inherit !important;
          color: transparent !important;
        }
        .goog-te-gadget .goog-te-combo {
          margin: 0;
        }
        .goog-te-gadget span {
          display: none !important;
        }
        .goog-te-gadget img {
          display: none !important;
        }
      `;
      if (!document.getElementById('google-translate-style')) {
        document.head.appendChild(style);
      }
    } else {
      if (window.google && window.google.translate) {
        const elem = document.getElementById('google_translate_element');
        if (elem && elem.innerHTML === '') {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi,te,ta,kn,mr,bn,gu,ml,pa,ur,es,fr,de,zh-CN,ja,ru,ar,pt,it', 
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          }, 'google_translate_element');
        }
      }
    }
  }, []);

  return (
    <div className="absolute top-6 left-0 w-full flex justify-center z-[100] pointer-events-none">
      <div 
        className="pointer-events-auto transition-all duration-300 hover:scale-105" 
        title="Translate Website"
      >
        <div id="google_translate_element"></div>
      </div>
    </div>
  );
};

export default LanguageTranslator;
