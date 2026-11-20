import type { Language } from '../shared/types';

export interface Translations {
  appName: string;
  tagline: string;
  loading: string;
  nav: {
    home: string;
    play: string;
    online: string;
    tournament: string;
    leaderboard: string;
    shop: string;
    profile: string;
    settings: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    quickChess: string;
    quickCheckers: string;
    chessDesc: string;
    checkersDesc: string;
    vsComputer: string;
    vsComputerDesc: string;
    playFriends: string;
    playFriendsDesc: string;
    local2p: string;
    local2pDesc: string;
    onlineMulti: string;
    onlineMultiDesc: string;
    tournamentMode: string;
    tournamentDesc: string;
    dailyReward: string;
    claimReward: string;
    claimedToday: string;
    missions: string;
    selectDifficulty: string;
    startMatch: string;
    timeControl: string;
  };
  difficulty: {
    beginner: string;
    easy: string;
    medium: string;
    expert: string;
  };
  game: {
    chess: string;
    checkers: string;
    yourTurn: string;
    opponentTurn: string;
    whiteTurn: string;
    blackTurn: string;
    darkTurn: string;
    lightTurn: string;
    check: string;
    checkmate: string;
    stalemate: string;
    draw: string;
    victory: string;
    defeat: string;
    matchDraw: string;
    undo: string;
    restart: string;
    flipBoard: string;
    resign: string;
    offerDraw: string;
    moveHistory: string;
    noMoves: string;
    captured: string;
    promotePawn: string;
    aiThinking: string;
    playAgain: string;
    rematch: string;
    backToMenu: string;
    multiJumpHint: string;
    mandatoryCaptureHint: string;
    xpEarned: string;
    coinsEarned: string;
    ratingChange: string;
    movesCount: string;
    player1: string;
    player2: string;
    computer: string;
    reasonCheckmate: string;
    reasonStalemate: string;
    reasonRepetition: string;
    reasonInsufficient: string;
    reasonFiftyMoves: string;
    reasonTimeout: string;
    reasonResigned: string;
    reasonAllCaptured: string;
    reasonNoMoves: string;
    reasonFortyMoves: string;
    reasonDrawAgreed: string;
  };
  online: {
    title: string;
    subtitle: string;
    createRoom: string;
    joinRoom: string;
    roomCode: string;
    enterCode: string;
    copyInvite: string;
    copied: string;
    waitingOpponent: string;
    shareCodeHint: string;
    leaveRoom: string;
    connected: string;
    disconnected: string;
    chatPlaceholder: string;
    send: string;
    rematchWaiting: string;
    rematchAccept: string;
    drawOffered: string;
    accept: string;
    decline: string;
  };
  tournament: {
    title: string;
    subtitle: string;
    chooseGame: string;
    bracketSize: string;
    players4: string;
    players8: string;
    startTournament: string;
    quarterfinals: string;
    semifinals: string;
    grandFinal: string;
    playNextMatch: string;
    eliminated: string;
    champion: string;
    championPrize: string;
    newTournament: string;
    vs: string;
  };
  profile: {
    title: string;
    username: string;
    saveName: string;
    chooseAvatar: string;
    level: string;
    rank: string;
    coins: string;
    gamesPlayed: string;
    wins: string;
    losses: string;
    draws: string;
    winRate: string;
    chessRating: string;
    checkersRating: string;
    matchHistory: string;
    noHistory: string;
    achievements: string;
    unlocked: string;
    locked: string;
  };
  leaderboard: {
    title: string;
    subtitle: string;
    sortChess: string;
    sortCheckers: string;
    sortWins: string;
    sortXp: string;
    rankCol: string;
    playerCol: string;
    chessCol: string;
    checkersCol: string;
    winsCol: string;
    levelCol: string;
    you: string;
  };
  shop: {
    title: string;
    subtitle: string;
    boardThemes: string;
    chessSkins: string;
    checkersSkins: string;
    equipped: string;
    equip: string;
    unlockFor: string;
    notEnoughCoins: string;
    free: string;
  };
  settings: {
    title: string;
    language: string;
    soundFx: string;
    music: string;
    themeMode: string;
    darkMode: string;
    lightMode: string;
    animations: string;
    animFull: string;
    animReduced: string;
    boardTheme: string;
    chessPieces: string;
    checkersPieces: string;
    on: string;
    off: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: 'Chess & Checkers Ultimate',
    tagline: 'Grandmaster Strategy Arena',
    loading: 'Preparing the Grandmaster Arena...',
    nav: {
      home: 'Home',
      play: 'Play',
      online: 'Online',
      tournament: 'Tournament',
      leaderboard: 'Leaderboard',
      shop: 'Armory',
      profile: 'Profile',
      settings: 'Settings',
    },
    home: {
      heroTitle: 'Master Every Square',
      heroSubtitle:
        'Challenge intelligent multi-tier AI, compete in knockout tournaments, or duel friends live with server-validated rules.',
      quickChess: 'Play Chess',
      quickCheckers: 'Play Checkers',
      chessDesc: 'Full FIDE rules, castling, en passant, promotions, and 4-tier minimax AI.',
      checkersDesc: '8x8 tactical board with mandatory multi-jumps, kings, and positional AI.',
      vsComputer: 'Play vs Computer',
      vsComputerDesc: 'Test your skill against 4 calibrated AI tiers.',
      playFriends: 'Play with Friends',
      playFriendsDesc: 'Create a private room code and invite a friend.',
      local2p: 'Local 2 Player',
      local2pDesc: 'Pass-and-play duel on a single screen.',
      onlineMulti: 'Online Multiplayer',
      onlineMultiDesc: 'Real-time synchronized rooms with live clocks.',
      tournamentMode: 'Tournament Mode',
      tournamentDesc: 'Knockout bracket championship with trophy & coin prizes.',
      dailyReward: 'Daily Tribute',
      claimReward: 'Claim Reward',
      claimedToday: 'Claimed Today',
      missions: 'Daily Missions',
      selectDifficulty: 'AI Difficulty',
      startMatch: 'Start Match',
      timeControl: 'Clock Time',
    },
    difficulty: {
      beginner: 'Beginner',
      easy: 'Easy',
      medium: 'Medium',
      expert: 'Expert',
    },
    game: {
      chess: 'Chess',
      checkers: 'Checkers',
      yourTurn: 'Your Turn',
      opponentTurn: 'Opponent Turn',
      whiteTurn: 'White to Move',
      blackTurn: 'Black to Move',
      darkTurn: 'Dark to Move',
      lightTurn: 'Light to Move',
      check: 'Check!',
      checkmate: 'Checkmate',
      stalemate: 'Stalemate',
      draw: 'Draw',
      victory: 'Victory!',
      defeat: 'Defeat',
      matchDraw: 'Match Drawn',
      undo: 'Undo',
      restart: 'Restart',
      flipBoard: 'Flip',
      resign: 'Resign',
      offerDraw: 'Offer Draw',
      moveHistory: 'Move History',
      noMoves: 'Make the opening move to begin.',
      captured: 'Captured',
      promotePawn: 'Choose Promotion Piece',
      aiThinking: 'AI Calculating...',
      playAgain: 'Play Again',
      rematch: 'Rematch',
      backToMenu: 'Main Menu',
      multiJumpHint: 'Multi-jump active: continue capturing with the highlighted piece.',
      mandatoryCaptureHint: 'Mandatory capture available: select a highlighted jumping piece.',
      xpEarned: 'XP Earned',
      coinsEarned: 'Coins Earned',
      ratingChange: 'Rating',
      movesCount: 'Moves',
      player1: 'Player 1',
      player2: 'Player 2',
      computer: 'Grandmaster AI',
      reasonCheckmate: 'Checkmate delivered',
      reasonStalemate: 'Stalemate position',
      reasonRepetition: 'Threefold repetition',
      reasonInsufficient: 'Insufficient material',
      reasonFiftyMoves: 'Fifty-move rule',
      reasonTimeout: 'Time expired',
      reasonResigned: 'Resignation',
      reasonAllCaptured: 'All opponent pieces captured',
      reasonNoMoves: 'No legal moves remaining',
      reasonFortyMoves: 'Forty-move quiet draw',
      reasonDrawAgreed: 'Draw agreed',
    },
    online: {
      title: 'Online Multiplayer Arena',
      subtitle: 'Host a private room or enter a 6-character code for real-time synchronized play.',
      createRoom: 'Create Room',
      joinRoom: 'Join Room',
      roomCode: 'Room Code',
      enterCode: 'Enter 6-character code',
      copyInvite: 'Copy Invite Link',
      copied: 'Copied!',
      waitingOpponent: 'Waiting for opponent to join...',
      shareCodeHint: 'Share this room code or invite link with a friend.',
      leaveRoom: 'Leave Room',
      connected: 'Connected',
      disconnected: 'Reconnecting...',
      chatPlaceholder: 'Send a quick message...',
      send: 'Send',
      rematchWaiting: 'Rematch requested. Waiting for opponent...',
      rematchAccept: 'Opponent wants a rematch! Accept',
      drawOffered: 'Opponent offered a draw',
      accept: 'Accept',
      decline: 'Decline',
    },
    tournament: {
      title: 'Grandmaster Knockout Tournament',
      subtitle: 'Battle through a live elimination bracket against increasingly formidable rivals.',
      chooseGame: 'Discipline',
      bracketSize: 'Bracket Size',
      players4: '4 Players',
      players8: '8 Players',
      startTournament: 'Enter Bracket',
      quarterfinals: 'Quarterfinals',
      semifinals: 'Semifinals',
      grandFinal: 'Grand Final',
      playNextMatch: 'Play Next Match',
      eliminated: 'Eliminated from Tournament',
      champion: 'Tournament Champion!',
      championPrize: 'Prize Awarded: +300 Coins & +250 XP',
      newTournament: 'New Tournament',
      vs: 'vs',
    },
    profile: {
      title: 'Player Profile',
      username: 'Display Name',
      saveName: 'Save',
      chooseAvatar: 'Select Emblem',
      level: 'Level',
      rank: 'Rank',
      coins: 'Coins',
      gamesPlayed: 'Games Played',
      wins: 'Wins',
      losses: 'Losses',
      draws: 'Draws',
      winRate: 'Win Rate',
      chessRating: 'Chess Rating',
      checkersRating: 'Checkers Rating',
      matchHistory: 'Recent Match History',
      noHistory: 'Complete a match to record your history.',
      achievements: 'Achievements',
      unlocked: 'Unlocked',
      locked: 'Locked',
    },
    leaderboard: {
      title: 'Global Leaderboard',
      subtitle: 'Top rated strategists ranked by ELO rating, victories, and experience.',
      sortChess: 'Chess ELO',
      sortCheckers: 'Checkers ELO',
      sortWins: 'Total Wins',
      sortXp: 'Experience',
      rankCol: '#',
      playerCol: 'Strategist',
      chessCol: 'Chess',
      checkersCol: 'Checkers',
      winsCol: 'Wins',
      levelCol: 'Level',
      you: 'You',
    },
    shop: {
      title: 'Royal Armory & Themes',
      subtitle: 'Unlock luxury boards and handcrafted piece sets using coins earned in battle.',
      boardThemes: 'Board Surfaces',
      chessSkins: 'Chess Piece Sets',
      checkersSkins: 'Checkers Piece Sets',
      equipped: 'Equipped',
      equip: 'Equip',
      unlockFor: 'Unlock',
      notEnoughCoins: 'Need more coins',
      free: 'Unlocked',
    },
    settings: {
      title: 'System & Preferences',
      language: 'Language',
      soundFx: 'Sound Effects',
      music: 'Ambient Music',
      themeMode: 'Interface Theme',
      darkMode: 'Obsidian Dark',
      lightMode: 'Ivory Light',
      animations: 'Motion & Animations',
      animFull: 'Smooth',
      animReduced: 'Reduced',
      boardTheme: 'Board Theme',
      chessPieces: 'Chess Pieces',
      checkersPieces: 'Checkers Pieces',
      on: 'On',
      off: 'Off',
    },
  },
  uz: {
    appName: 'Chess & Checkers Ultimate',
    tagline: 'Grossmeyster Strategiya Arenasi',
    loading: 'Grossmeyster arenasi tayyorlanmoqda...',
    nav: {
      home: 'Bosh sahifa',
      play: 'Oʻyin',
      online: 'Onlayn',
      tournament: 'Turnir',
      leaderboard: 'Reyting',
      shop: 'Doʻkon',
      profile: 'Profil',
      settings: 'Sozlamalar',
    },
    home: {
      heroTitle: 'Har Bir Katakni Zabt Eting',
      heroSubtitle:
        'Aqlli sunʼiy intellekt bilan bellashing, turnirlarda gʻolib boʻling yoki doʻstlaringiz bilan jonli onlayn oʻynang.',
      quickChess: 'Shaxmat Oʻynash',
      quickCheckers: 'Shashka Oʻynash',
      chessDesc: 'Toʻliq FIDE qoidalari, rokirovka, en passant, piyodani almashtirish va 4 darajali AI.',
      checkersDesc: '8x8 taxta, majburiy koʻp sakrashlar, damka chiqarish va taktik AI.',
      vsComputer: 'Kompyuterga Qarshi',
      vsComputerDesc: '4 ta qiyinlik darajasidagi aqlli AI bilan kuch sinashing.',
      playFriends: 'Doʻstlar Bilan Oʻynash',
      playFriendsDesc: 'Shaxsiy xona kodi yarating va doʻstingizni taklif qiling.',
      local2p: 'Mahalliy 2 Oʻyinchi',
      local2pDesc: 'Bitta ekranda navbatma-navbat duel.',
      onlineMulti: 'Onlayn Koʻp Oʻyinchi',
      onlineMultiDesc: 'Real vaqt rejimida sinxronlashtirilgan xonalar va soatlar.',
      tournamentMode: 'Turnir Rejimi',
      tournamentDesc: 'Kubok va tangalar uchun olimpiya tizimidagi chempionat.',
      dailyReward: 'Kunlik Mukofot',
      claimReward: 'Mukofotni Olish',
      claimedToday: 'Bugun Olindi',
      missions: 'Kunlik Topshiriqlar',
      selectDifficulty: 'AI Darajasi',
      startMatch: 'Oʻyinni Boshlash',
      timeControl: 'Vaqt Nazorati',
    },
    difficulty: {
      beginner: 'Boshlangʻich',
      easy: 'Oson',
      medium: 'Oʻrtacha',
      expert: 'Ekspert',
    },
    game: {
      chess: 'Shaxmat',
      checkers: 'Shashka',
      yourTurn: 'Sizning Navbatingiz',
      opponentTurn: 'Raqib Navbati',
      whiteTurn: 'Oqlar Yuradi',
      blackTurn: 'Qoralar Yuradi',
      darkTurn: 'Toʻqlar Yuradi',
      lightTurn: 'Ochlar Yuradi',
      check: 'Shoh!',
      checkmate: 'Mot',
      stalemate: 'Pat',
      draw: 'Durrang',
      victory: 'Gʻalaba!',
      defeat: 'Magʻlubiyat',
      matchDraw: 'Durrang Natija',
      undo: 'Ortga',
      restart: 'Qayta',
      flipBoard: 'Burish',
      resign: 'Taslim',
      offerDraw: 'Durrang Taklifi',
      moveHistory: 'Yurishlar Tarixi',
      noMoves: 'Boshlash uchun birinchi yurishni qiling.',
      captured: 'Olinganlar',
      promotePawn: 'Sipoh Tanlang',
      aiThinking: 'AI Oʻylamoqda...',
      playAgain: 'Yana Oʻynash',
      rematch: 'Revansh',
      backToMenu: 'Bosh Menyu',
      multiJumpHint: 'Koʻp sakrash faol: ajratilgan shashka bilan urishni davom eting.',
      mandatoryCaptureHint: 'Majburiy urish mavjud: ajratilgan donani tanlang.',
      xpEarned: 'Olingan XP',
      coinsEarned: 'Olingan Tangalar',
      ratingChange: 'Reyting',
      movesCount: 'Yurishlar',
      player1: '1-Oʻyinchi',
      player2: '2-Oʻyinchi',
      computer: 'Grossmeyster AI',
      reasonCheckmate: 'Mot eʼlon qilindi',
      reasonStalemate: 'Pat holati',
      reasonRepetition: 'Uch karra takrorlanish',
      reasonInsufficient: 'Yetarli sipoh yoʻq',
      reasonFiftyMoves: '50 yurish qoidasi',
      reasonTimeout: 'Vaqt tugadi',
      reasonResigned: 'Taslim boʻldi',
      reasonAllCaptured: 'Barcha raqib donalari olindi',
      reasonNoMoves: 'Qonuniy yurish qolmadi',
      reasonFortyMoves: '40 yurish qoidasi boʻyicha durrang',
      reasonDrawAgreed: 'Durrangga kelishildi',
    },
    online: {
      title: 'Onlayn Koʻp Oʻyinchi Arenasi',
      subtitle: 'Shaxsiy xona oching yoki 6 belgili kod orqali jonli oʻyinga qoʻshiling.',
      createRoom: 'Xona Yaratish',
      joinRoom: 'Xonaga Kirish',
      roomCode: 'Xona Kodi',
      enterCode: '6 belgili kodni kiriting',
      copyInvite: 'Havolani Nusxalash',
      copied: 'Nusxalandi!',
      waitingOpponent: 'Raqib qoʻshilishi kutilmoqda...',
      shareCodeHint: 'Ushbu kod yoki havolani doʻstingizga yuboring.',
      leaveRoom: 'Xonadan Chiqish',
      connected: 'Ulangan',
      disconnected: 'Qayta ulanilmoqda...',
      chatPlaceholder: 'Qisqa xabar yozing...',
      send: 'Yuborish',
      rematchWaiting: 'Revansh soʻraldi. Raqib kutilmoqda...',
      rematchAccept: 'Raqib revansh soʻradi! Qabul qilish',
      drawOffered: 'Raqib durrang taklif qildi',
      accept: 'Qabul qilish',
      decline: 'Rad etish',
    },
    tournament: {
      title: 'Olimpiya Turniri',
      subtitle: 'Kuchayib boruvchi raqiblarga qarshi pley-off bosqichlaridan oʻting.',
      chooseGame: 'Yoʻnalish',
      bracketSize: 'Ishtirokchilar',
      players4: '4 Oʻyinchi',
      players8: '8 Oʻyinchi',
      startTournament: 'Turnirni Boshlash',
      quarterfinals: 'Chorak Final',
      semifinals: 'Yarim Final',
      grandFinal: 'Katta Final',
      playNextMatch: 'Keyingi Oʻyin',
      eliminated: 'Turnirdan Chiqdingiz',
      champion: 'Turnir Chempioni!',
      championPrize: 'Mukofot: +300 Tanga va +250 XP',
      newTournament: 'Yangi Turnir',
      vs: 'vs',
    },
    profile: {
      title: 'Oʻyinchi Profili',
      username: 'Foydalanuvchi Nomi',
      saveName: 'Saqlash',
      chooseAvatar: 'Emblema Tanlang',
      level: 'Daraja',
      rank: 'Unvon',
      coins: 'Tangalar',
      gamesPlayed: 'Oʻyinlar',
      wins: 'Gʻalabalar',
      losses: 'Magʻlubiyatlar',
      draws: 'Durranglar',
      winRate: 'Gʻalaba %',
      chessRating: 'Shaxmat Reytingi',
      checkersRating: 'Shashka Reytingi',
      matchHistory: 'Soʻnggi Oʻyinlar Tarixi',
      noHistory: 'Tarixni koʻrish uchun kamida bitta oʻyin oʻynang.',
      achievements: 'Yutuqlar',
      unlocked: 'Ochilgan',
      locked: 'Qulflangan',
    },
    leaderboard: {
      title: 'Global Reyting Jadvali',
      subtitle: 'ELO reytingi, gʻalabalar va tajriba boʻyicha eng kuchli oʻyinchilar.',
      sortChess: 'Shaxmat ELO',
      sortCheckers: 'Shashka ELO',
      sortWins: 'Gʻalabalar',
      sortXp: 'Tajriba (XP)',
      rankCol: '#',
      playerCol: 'Oʻyinchi',
      chessCol: 'Shaxmat',
      checkersCol: 'Shashka',
      winsCol: 'Gʻalaba',
      levelCol: 'Daraja',
      you: 'Siz',
    },
    shop: {
      title: 'Qirollik Doʻkoni',
      subtitle: 'Gʻalabalardan toʻplangan tangalarga yangi taxtalar va sipoh dizaynlarini oching.',
      boardThemes: 'Taxta Dizaynlari',
      chessSkins: 'Shaxmat Sipohlari',
      checkersSkins: 'Shashka Donalari',
      equipped: 'Tanlangan',
      equip: 'Tanlash',
      unlockFor: 'Ochish',
      notEnoughCoins: 'Tanga yetarli emas',
      free: 'Ochiq',
    },
    settings: {
      title: 'Tizim va Sozlamalar',
      language: 'Til',
      soundFx: 'Ovoz Effektlari',
      music: 'Fon Musiqasi',
      themeMode: 'Interfeys Mavzusi',
      darkMode: 'Tungi (Obsidian)',
      lightMode: 'Kunduzgi (Fil suyagi)',
      animations: 'Animatsiyalar',
      animFull: 'Toʻliq',
      animReduced: 'Kamaytirilgan',
      boardTheme: 'Taxta Mavzusi',
      chessPieces: 'Shaxmat Dizayni',
      checkersPieces: 'Shashka Dizayni',
      on: 'Yoqilgan',
      off: 'Oʻchirilgan',
    },
  },
  ru: {
    appName: 'Chess & Checkers Ultimate',
    tagline: 'Арена Гроссмейстеров',
    loading: 'Подготовка арены гроссмейстеров...',
    nav: {
      home: 'Главная',
      play: 'Играть',
      online: 'Онлайн',
      tournament: 'Турнир',
      leaderboard: 'Лидеры',
      shop: 'Магазин',
      profile: 'Профиль',
      settings: 'Настройки',
    },
    home: {
      heroTitle: 'Покорите Каждую Клетку',
      heroSubtitle:
        'Сражайтесь с умным ИИ четырёх уровней, побеждайте в турнирах на выбывание или играйте онлайн с друзьями.',
      quickChess: 'Играть в Шахматы',
      quickCheckers: 'Играть в Шашки',
      chessDesc: 'Полные правила ФИДЕ, рокировка, взятие на проходе, превращение пешки и ИИ.',
      checkersDesc: 'Доска 8x8 с обязательным взятием, сериями прыжков и дамками.',
      vsComputer: 'Против Компьютера',
      vsComputerDesc: 'Испытайте себя против 4 калиброванных уровней ИИ.',
      playFriends: 'Играть с Друзьями',
      playFriendsDesc: 'Создайте приватную комнату и отправьте код другу.',
      local2p: 'На Одном Экране',
      local2pDesc: 'Локальная партия для двоих игроков.',
      onlineMulti: 'Онлайн Мультиплеер',
      onlineMultiDesc: 'Синхронизированные комнаты с таймерами в реальном времени.',
      tournamentMode: 'Режим Турнира',
      tournamentDesc: 'Сетка на выбывание с трофеями и наградами в монетах.',
      dailyReward: 'Ежедневная Награда',
      claimReward: 'Забрать Награду',
      claimedToday: 'Получено Сегодня',
      missions: 'Ежедневные Задания',
      selectDifficulty: 'Сложность ИИ',
      startMatch: 'Начать Партию',
      timeControl: 'Контроль Времени',
    },
    difficulty: {
      beginner: 'Новичок',
      easy: 'Лёгкий',
      medium: 'Средний',
      expert: 'Эксперт',
    },
    game: {
      chess: 'Шахматы',
      checkers: 'Шашки',
      yourTurn: 'Ваш Ход',
      opponentTurn: 'Ход Соперника',
      whiteTurn: 'Ход Белых',
      blackTurn: 'Ход Чёрных',
      darkTurn: 'Ход Тёмных',
      lightTurn: 'Ход Светлых',
      check: 'Шах!',
      checkmate: 'Мат',
      stalemate: 'Пат',
      draw: 'Ничья',
      victory: 'Победа!',
      defeat: 'Поражение',
      matchDraw: 'Ничья в Партии',
      undo: 'Отмена',
      restart: 'Заново',
      flipBoard: 'Поворот',
      resign: 'Сдаться',
      offerDraw: 'Ничья',
      moveHistory: 'История Ходов',
      noMoves: 'Сделайте первый ход, чтобы начать.',
      captured: 'Взятые',
      promotePawn: 'Выберите Фигуру Превращения',
      aiThinking: 'ИИ рассчитывает...',
      playAgain: 'Играть Снова',
      rematch: 'Реванш',
      backToMenu: 'Главное Меню',
      multiJumpHint: 'Серия взятий: продолжайте бить выделенной шашкой.',
      mandatoryCaptureHint: 'Обязательное взятие: выберите подсвеченную шашку.',
      xpEarned: 'Получено XP',
      coinsEarned: 'Монеты',
      ratingChange: 'Рейтинг',
      movesCount: 'Ходов',
      player1: 'Игрок 1',
      player2: 'Игрок 2',
      computer: 'Гроссмейстер ИИ',
      reasonCheckmate: 'Поставлен мат',
      reasonStalemate: 'Пат на доске',
      reasonRepetition: 'Троекратное повторение',
      reasonInsufficient: 'Недостаточно материала',
      reasonFiftyMoves: 'Правило 50 ходов',
      reasonTimeout: 'Время вышло',
      reasonResigned: 'Сдача партии',
      reasonAllCaptured: 'Все шашки соперника взяты',
      reasonNoMoves: 'Нет возможных ходов',
      reasonFortyMoves: 'Ничья по правилу 40 ходов',
      reasonDrawAgreed: 'Согласие на ничью',
    },
    online: {
      title: 'Онлайн Арена Мультиплеера',
      subtitle: 'Создайте комнату или введите 6-значный код для синхронной партии.',
      createRoom: 'Создать Комнату',
      joinRoom: 'Войти в Комнату',
      roomCode: 'Код Комнаты',
      enterCode: 'Введите 6-значный код',
      copyInvite: 'Копировать Ссылку',
      copied: 'Скопировано!',
      waitingOpponent: 'Ожидание подключения соперника...',
      shareCodeHint: 'Отправьте этот код или ссылку приглашения другу.',
      leaveRoom: 'Выйти',
      connected: 'Подключено',
      disconnected: 'Переподключение...',
      chatPlaceholder: 'Быстрое сообщение...',
      send: 'Отправить',
      rematchWaiting: 'Запрос на реванш отправлен...',
      rematchAccept: 'Соперник предлагает реванш! Принять',
      drawOffered: 'Соперник предложил ничью',
      accept: 'Принять',
      decline: 'Отклонить',
    },
    tournament: {
      title: 'Турнир на Выбывание',
      subtitle: 'Пройдите турнирную сетку, побеждая всё более сильных соперников.',
      chooseGame: 'Дисциплина',
      bracketSize: 'Размер Сетки',
      players4: '4 Игрока',
      players8: '8 Игроков',
      startTournament: 'Начать Турнир',
      quarterfinals: 'Четвертьфинал',
      semifinals: 'Полуфинал',
      grandFinal: 'Гранд-Финал',
      playNextMatch: 'Следующий Матч',
      eliminated: 'Вы выбыли из турнира',
      champion: 'Чемпион Турнира!',
      championPrize: 'Приз: +300 Монет и +250 XP',
      newTournament: 'Новый Турнир',
      vs: 'против',
    },
    profile: {
      title: 'Профиль Игрока',
      username: 'Имя Игрока',
      saveName: 'Сохранить',
      chooseAvatar: 'Выберите Эмблему',
      level: 'Уровень',
      rank: 'Титул',
      coins: 'Монеты',
      gamesPlayed: 'Сыграно Игр',
      wins: 'Победы',
      losses: 'Поражения',
      draws: 'Ничьи',
      winRate: 'Винрейт',
      chessRating: 'Рейтинг Шахмат',
      checkersRating: 'Рейтинг Шашек',
      matchHistory: 'История Матчей',
      noHistory: 'Завершите партию, чтобы увидеть историю.',
      achievements: 'Достижения',
      unlocked: 'Открыто',
      locked: 'Закрыто',
    },
    leaderboard: {
      title: 'Глобальный Рейтинг',
      subtitle: 'Лучшие стратеги по рейтингу Эло, победам и опыту.',
      sortChess: 'Шахматы Эло',
      sortCheckers: 'Шашки Эло',
      sortWins: 'Победы',
      sortXp: 'Опыт (XP)',
      rankCol: '#',
      playerCol: 'Стратег',
      chessCol: 'Шахматы',
      checkersCol: 'Шашки',
      winsCol: 'Победы',
      levelCol: 'Уровень',
      you: 'Вы',
    },
    shop: {
      title: 'Королевский Арсенал',
      subtitle: 'Открывайте элитные доски и наборы фигур за заработанные монеты.',
      boardThemes: 'Стили Досок',
      chessSkins: 'Шахматные Фигуры',
      checkersSkins: 'Наборы Шашек',
      equipped: 'Выбрано',
      equip: 'Выбрать',
      unlockFor: 'Открыть',
      notEnoughCoins: 'Мало монет',
      free: 'Открыто',
    },
    settings: {
      title: 'Настройки и Система',
      language: 'Язык',
      soundFx: 'Звуковые Эффекты',
      music: 'Фоновая Музыка',
      themeMode: 'Тема Интерфейса',
      darkMode: 'Тёмный Обсидиан',
      lightMode: 'Светлый Мрамор',
      animations: 'Анимации',
      animFull: 'Полные',
      animReduced: 'Сниженные',
      boardTheme: 'Тема Доски',
      chessPieces: 'Фигуры Шахмат',
      checkersPieces: 'Фигуры Шашек',
      on: 'Вкл',
      off: 'Выкл',
    },
  },
};
