import { useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';

export const useRTL = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const nativeRTL = I18nManager.isRTL;

  // If the language direction matches the native direction, we use standard 'row'.
  // If they don't match (e.g. language is Arabic but native is LTR, or vice versa), 
  // we use 'row-reverse' to "fake" the correct direction until the next restart.
  const shouldReverse = isArabic !== nativeRTL;

  useEffect(() => {
    if (isArabic !== nativeRTL) {
      I18nManager.allowRTL(isArabic);
      I18nManager.forceRTL(isArabic);
      
      // Note: On native platforms, a full app restart is usually required
      // for native components to pick up the RTL change.
      // However, our JS-based dynamic styles with 'row-reverse' will react immediately.
    }
  }, [isArabic, nativeRTL]);

  return {
    isRTL: isArabic,
    textAlign: isArabic ? 'right' as const : 'left' as const,
    flexDirection: shouldReverse ? 'row-reverse' as const : 'row' as const,
  };
};