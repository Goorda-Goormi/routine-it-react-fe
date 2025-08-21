export interface StreakInfo {
  icon: string;
  color: string;
  bgColor: string;
  containBgColor: string;
  borderColor: string;
  textColor: string;
  subTextColor: string;
  stage: string;
}

export function getStreakInfo(streakDays: number): StreakInfo {
  if (streakDays >= 365) {
    // 전설 - 라이트모드: 밝은 골드 파스텔, 다크모드: 찐한 노란색 배경
    return {
      icon: '👑',
      color: 'text-amber-700 dark:text-white',
      bgColor: 'bg-gradient-to-br from-yellow-300 to-red-400',
      containBgColor: 'bg-gradient-to-br from-yellow-500/40 to-red-200/50 border-red-200/70',
      borderColor: 'border-red-400/50',
      textColor: 'text-orange-600 dark:text-white font-bold',
      subTextColor: 'text-orange-700 dark:text-white dark:opacity-90 font-normal',
      stage: '전설'
    };
  } else if (streakDays >= 180) {
    // 열매 - 라이트모드: 밝은 복숭아 파스텔, 다크모드: 찐한 오렌지색 배경
    return {
      icon: '🍎',
      color: 'text-orange-700 dark:text-white',
      bgColor: 'bg-gradient-to-br from-orange-300 to-red-200 border-orange-200/70 dark:bg-card-peach-bg dark:border-none',
      containBgColor: 'bg-orange-100',
      borderColor: 'border-orange-400/60',
      textColor: 'text-orange-800 dark:text-white font-bold',
      subTextColor: 'text-orange-600 dark:text-white dark:opacity-90 font-normal',
      stage: '열매'
    };
  } else if (streakDays >= 90) {
    // 거목 - 라이트모드: 밝은 하늘 파스텔, 다크모드: 찐한 하늘색 배경
    return {
      icon: '🌳',
      color: 'text-emerald-700 dark:text-white',
      bgColor: 'bg-sky-200/80 dark:bg-card-mint-bg dark:border-none',
      containBgColor: 'bg-sky-200/20',
      borderColor: 'border-sky-600/40',
      textColor: 'text-sky-700 dark:text-white font-bold',
      subTextColor: 'text-sky-600 dark:text-white dark:opacity-90 font-normal',
      stage: '거목'
    };
  } else if (streakDays >= 30) {
    // 개화 - 라이트모드: 밝은 핑크 파스텔, 다크모드: 찐한 보라색 배경
    return {
      icon: '🌸',
      color: 'text-pink-700 dark:text-white',
      bgColor: 'bg-gradient-to-br from-pink-100 to-rose-100 border-pink-200/70 dark:bg-card-lavender-bg dark:border-none',
      containBgColor: 'bg-pink-100/30',
      borderColor: 'border-pink-300',
      textColor: 'text-pink-800 dark:text-white font-bold',
      subTextColor: 'text-pink-600 dark:text-white dark:opacity-90 font-normal',
      stage: '개화'
    };
  } else if (streakDays >= 7) {
    // 성장 - 라이트모드: 밝은 베이지 파스텔, 다크모드: 찐한 갈색 배경
    return {
      icon: '🌿',
      color: 'text-yellow-700 dark:text-white',
      bgColor: 'bg-yellow-200/90 dark:bg-card-yellow-bg dark:border-none',
      containBgColor: 'bg-yellow-100/30',
      borderColor: 'border-yellow-400/70',
      textColor: 'text-yellow-800 dark:text-white font-bold',
      subTextColor: 'text-yellow-600 dark:text-white dark:opacity-90 font-normal',
      stage: '성장'
    };
  } else {
    // 새싹 - 라이트모드: 밝은 노랑 파스텔, 다크모드: 찐한 노란색 배경
    return {
      icon: '🌱',
      color: 'text-yellow-700 dark:text-white',
      bgColor: 'bg-yellow-600/40 dark:bg-card-ivory-bg dark:border-none',
      containBgColor: 'bg-yellow-700/10',
      borderColor: 'border-yellow-800/40',
      textColor: 'text-yellow-900 dark:text-white font-medium',
      subTextColor: 'text-yellow-800/60 dark:text-white dark:opacity-90 font-normal',
      stage: '새싹'
    };
  }
}

export function getStreakMessage(streakDays: number): string {
  const info = getStreakInfo(streakDays);
  
  if (streakDays >= 365) {
    return '전설적인 습관 달성! 끝까지 함께 달려가요!';
  } else if (streakDays >= 180) {
    return '탐스런 열매가 맺혔어요! 꾸준함의 결실이에요!';
  } else if (streakDays >= 90) {
    return '커다란 나무로 성장했어요! 습관이 뿌리 깊이 내렸어요!';
  } else if (streakDays >= 7) {
    return '새싹이 커졌어요! 습관이 자리잡고 있다는 증거예요!';
  } else {
    return '새로운 시작! 작은 새싹부터 차근차근!';
  }
}