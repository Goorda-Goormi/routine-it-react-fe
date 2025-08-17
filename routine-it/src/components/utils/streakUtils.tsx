export interface StreakInfo {
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  subTextColor: string;
  stage: string;
}

export function getStreakInfo(streakDays: number): StreakInfo {
  if (streakDays >= 365) {
    // 전설 - 라이트모드: 밝은 골드 파스텔, 다크모드: 찐한 노란색 배경
    return {
      icon: '🌟',
      color: 'text-amber-700 dark:text-white',
      bgColor: 'bg-gradient-to-br from-yellow-100 to-amber-100 border-amber-200/70 dark:bg-card-cream-bg dark:border-none',
      borderColor: 'border',
      textColor: 'text-amber-800 dark:text-white font-medium',
      subTextColor: 'text-amber-600 dark:text-white dark:opacity-90 font-normal',
      stage: '전설'
    };
  } else if (streakDays >= 180) {
    // 열매 - 라이트모드: 밝은 복숭아 파스텔, 다크모드: 찐한 오렌지색 배경
    return {
      icon: '🍎',
      color: 'text-orange-700 dark:text-white',
      bgColor: 'bg-gradient-to-br from-orange-100 to-red-100 border-orange-200/70 dark:bg-card-peach-bg dark:border-none',
      borderColor: 'border',
      textColor: 'text-orange-800 dark:text-white font-medium',
      subTextColor: 'text-orange-600 dark:text-white dark:opacity-90 font-normal',
      stage: '열매'
    };
  } else if (streakDays >= 90) {
    // 거목 - 라이트모드: 밝은 민트 파스텔, 다크모드: 찐한 민트색 배경
    return {
      icon: '🌳',
      color: 'text-emerald-700 dark:text-white',
      bgColor: 'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-200/70 dark:bg-card-mint-bg dark:border-none',
      borderColor: 'border',
      textColor: 'text-emerald-800 dark:text-white font-medium',
      subTextColor: 'text-emerald-600 dark:text-white dark:opacity-90 font-normal',
      stage: '거목'
    };
  } else if (streakDays >= 30) {
    // 개화 - 라이트모드: 밝은 핑크 파스텔, 다크모드: 찐한 보라색 배경
    return {
      icon: '🌸',
      color: 'text-pink-700 dark:text-white',
      bgColor: 'bg-gradient-to-br from-pink-100 to-rose-100 border-pink-200/70 dark:bg-card-lavender-bg dark:border-none',
      borderColor: 'border',
      textColor: 'text-pink-800 dark:text-white font-medium',
      subTextColor: 'text-pink-600 dark:text-white dark:opacity-90 font-normal',
      stage: '개화'
    };
  } else if (streakDays >= 7) {
    // 성장 - 라이트모드: 밝은 라임 파스텔, 다크모드: 찐한 빨간색 배경
    return {
      icon: '🌿',
      color: 'text-lime-700 dark:text-white',
      bgColor: 'bg-gradient-to-br from-lime-100 to-green-100 border-lime-200/70 dark:bg-card-ivory-bg dark:border-none',
      borderColor: 'border',
      textColor: 'text-lime-800 dark:text-white font-medium',
      subTextColor: 'text-lime-600 dark:text-white dark:opacity-90 font-normal',
      stage: '성장'
    };
  } else {
    // 새싹 - 라이트모드: 밝은 연두 파스텔, 다크모드: 찐한 주황색 배경
    return {
      icon: '🌱',
      color: 'text-green-700 dark:text-white',
      bgColor: 'bg-gradient-to-br from-green-100 to-lime-100 border-green-200/70 dark:bg-card-yellow-bg dark:border-none',
      borderColor: 'border',
      textColor: 'text-green-800 dark:text-white font-medium',
      subTextColor: 'text-green-600 dark:text-white dark:opacity-90 font-normal',
      stage: '새싹'
    };
  }
}

export function getStreakMessage(streakDays: number): string {
  const info = getStreakInfo(streakDays);
  
  if (streakDays >= 365) {
    return '전설적인 습관 달성! 정말 대단해요!';
  } else if (streakDays >= 180) {
    return '열매를 맺었어요! 꾸준함의 결실이에요!';
  } else if (streakDays >= 90) {
    return '거목으로 성장했어요! 습관이 뿌리내렸어요!';
  } else if (streakDays >= 7) {
    return '새싹이 자라고 있어요! 일주일 연속 달성!';
  } else {
    return '새로운 시작! 작은 새싹부터 차근차근!';
  }
}