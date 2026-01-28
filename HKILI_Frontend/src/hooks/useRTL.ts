import { useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';

export const useRTL = () => {
  const { i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);

  useEffect(() => {
    const isArabic = i18n.language === 'ar';
    
    if (isArabic !== I18nManager.isRTL) {
      I18nManager.allowRTL(isArabic);
      I18nManager.forceRTL(isArabic);
      setIsRTL(isArabic);
      
      // Note: On native platforms, this would require app restart
      // On web, it works immediately
    }
  }, [i18n.language]);

  return {
    isRTL,
    textAlign: isRTL ? 'right' as const : 'left' as const,
    flexDirection: isRTL ? 'row-reverse' as const : 'row' as const,
  };
};