'use strict';

// Missing/broken Lottie files (e.g. assets/giftGift.json) fall back to the
// matching static icon instead of leaving a blank slot on the reel/lists.
(function installLottieFallback() {
  if (typeof lottie === 'undefined' || lottie.__voidFallback) return;
  const load = lottie.loadAnimation.bind(lottie);
  const ICON_FOR = { RoseBouquet: 'Flowers' };
  lottie.loadAnimation = function (opts) {
    const anim = load(opts);
    try {
      const m = opts && typeof opts.path === 'string' && opts.path.match(/assets\/gift([A-Za-z]+)\.json$/);
      if (m && opts.container && anim && anim.addEventListener) {
        anim.addEventListener('data_failed', () => {
          const img = new Image();
          img.src = `assets/${ICON_FOR[m[1]] || m[1]}.svg`;
          img.alt = '';
          img.style.cssText = 'width:100%;height:100%;object-fit:contain';
          img.onerror = () => img.remove();
          opts.container.replaceChildren(img);
        });
      }
    } catch { /* ignore */ }
    return anim;
  };
  lottie.__voidFallback = true;
})();

// ============================================
// GLOBAL CONFIGURATION
// ============================================

const CONFIG = {
  // Where the "Contact Support" row opens. Point this at your support bot/account.
  SUPPORT_URL: 'https://t.me/VoidGiftsOfficial',
  MAX_INVENTORY_DISPLAY: 6,
  MAX_NOTIFICATIONS: 15,
  MAX_LIVE_NOTIFICATIONS: 15,
  NOTIFICATION_DURATION: 25000,
  LOADING_MIN_TIME: 2000,
  SPIN_DURATION: 4500,
  SPIN_MAX_SPEED: 25,
  CUBE_WIDTH: 120,
  GAP_WIDTH: 48,
  BALANCE_SYNC_INTERVAL: 30000,
  DAILY_COOLDOWN_MS: 24 * 60 * 60 * 1000,   // Daily Spin: one spin per 24h

  // ── Void Spin (second wheel, home-page banner) ──
  // Own knobs, not shared with the daily wheel's CONFIG values above —
  // keeps the two engines tunable independently. NOTE: these must match
  // the actual .cube/.wheel CSS (120px cube + 48px gap via `gap: 3rem`)
  // since void cubes reuse the same .cube class with no size override —
  // if these drift from the real rendered dimensions the scroll/recycle
  // math falls out of sync with the DOM and the wheel visually crushes.
  VOID_SPIN_COST: 50,          // Stars deducted the moment Spin is pressed
  VOID_SPIN_DURATION: 4500,
  VOID_SPIN_MAX_SPEED: 25,
  VOID_CUBE_WIDTH: 120,
  VOID_GAP_WIDTH: 48,

  // ── Furry Spin (third wheel) ──
  // Same engine and same knobs as Void Spin, tunable on their own. The 120px
  // cube + 48px gap must stay in step with the .cube CSS, same as above.
  FURRY_SPIN_COST: 150,         // Stars deducted the moment Spin is pressed
  FURRY_SPIN_DURATION: 4500,
  FURRY_SPIN_MAX_SPEED: 25,
  FURRY_CUBE_WIDTH: 120,
  FURRY_GAP_WIDTH: 48,

  // ── Hex Spin (500 Stars) ──
  HEX_SPIN_COST: 500,
  HEX_SPIN_DURATION: 4500,
  HEX_SPIN_MAX_SPEED: 25,
  HEX_CUBE_WIDTH: 120,
  HEX_GAP_WIDTH: 48,

  // ── Astral Spin (1000 Stars) ──
  ASTRAL_SPIN_COST: 1000,
  ASTRAL_SPIN_DURATION: 4500,
  ASTRAL_SPIN_MAX_SPEED: 25,
  ASTRAL_CUBE_WIDTH: 120,
  ASTRAL_GAP_WIDTH: 48,

  // ── Telegram channel subscription gate ──
  SUBSCRIPTION_REQUIRED: false,
  SUBSCRIPTION_CHANNEL_USERNAME: '@VoidGiftsOfficial',
  SUBSCRIPTION_CHANNEL_URL: 'https://t.me/VoidGiftsOfficial',
  // Expected response: { "subscribed": true|false }.
  // This route is served by the main bot (bot.js / messageHandlers.js), the same
  // service as /create-invoice, NOT by the data store, which has no such route.
  SUBSCRIPTION_CHECK_URL: 'https://vgservers-dev-85d2.up.railway.app/check-subscription'
};

const PRIZE_COIN_VALUES = {};   // filled from the game server (GameAPI.loadConfig)

const RARE_GIFTS  = ['Ring', 'Trophy', 'Diamond', 'Calendar', 'Rocket', 'Star Notepad', 'Instant Ramen', 'Socks', 'Lollipop', 'Input Key', 'Astral Shard', 'Kissed Frog', 'Voodoo Doll', 'Vintage Cigar', 'Witch Hat', 'Light Sword', 'Lucky Locket'];
const NFT_GIFTS   = ['Calendar', 'Star Notepad', 'Instant Ramen', 'Socks', 'Lollipop', 'Input Key', 'Astral Shard', 'Kissed Frog', 'Voodoo Doll', 'Vintage Cigar', 'Witch Hat', 'Light Sword', 'Lucky Locket'];

// Static SVG icons used everywhere EXCEPT the spin wheel cubes/win-reveal
// wheel animation, which keep the Lottie JSON (that's the one place the
// motion actually matters). Every other Lottie instance — inventory grid,
// prize modal, full inventory modal, live notifications, legend icons —
// was adding up to real lag on phones, so those get lightweight static
// SVGs instead.
const GIFT_SVG_ICONS = {
  'Heart':        'assets/Heart.svg',
  'Bear':         'assets/Bear.svg',
  'Rose':         'assets/Rose.svg',
  'Gift':         'assets/Gift.svg',
  'Cake':         'assets/Cake.svg',
  'Rose Bouquet': 'assets/Flowers.svg',
  'Ring':         'assets/Ring.svg',
  'Trophy':       'assets/Trophy.svg',
  'Diamond':      'assets/Diamond.svg',
  'Calendar':     'assets/Calender.svg',

  // ── Void Spin exclusives. You'll need to actually add these three
  // SVG files to /assets — everything else in the pipeline (inventory,
  // prize modal, notifications) already looks them up by this map. ──
  'Rocket':        'assets/Rocket.svg',
  'Star Notepad':  'assets/StarNotepad.svg',
  'Instant Ramen': 'assets/InstantRamen.svg',

  // ── Furry Spin ──
  'Champagne':     'assets/Champagne.svg',
  'Socks':         'assets/Socks.svg',
  'Lollipop':      'assets/Lollipop.svg',

  // ── Added with the case rebalance ──
  'Input Key':     'assets/InputKey.svg',
  'Astral Shard':  'assets/AstralShard.svg',

  // ── Hex / Astral Spin NFTs (drop these SVGs into /assets) ──
  'Kissed Frog':  'assets/KissedFrog.svg',
  'Voodoo Doll':  'assets/VoodooDoll.svg',
  'Vintage Cigar': 'assets/VintageCigar.svg',
  'Witch Hat':    'assets/WitchHat.svg',
  'Light Sword':  'assets/LightSword.svg',
  'Lucky Locket': 'assets/LuckyLocket.svg'
};

// ── REAL odds. These decide what the player actually wins. ──
const SPIN_PRIZES = [];   // filled from the game server (GameAPI.loadConfig) — display rows only

// ── DISPLAY-ONLY odds. Used for idle wheel + pre-reveal repaint so the
// reel *looks* more generous than it actually is. Never touches the
// real outcome — selectPrize() (using SPIN_PRIZES) still decides what
// the player wins. Same ids/values/lottie paths as SPIN_PRIZES, just
// different `chance` weighting. ──
const PREVIEW_PRIZES = [];   // filled from the game server (GameAPI.loadConfig) — display rows only

// ============================================
// VOID SPIN — second wheel, home-page banner.
// Duplicated (not merged) from SPIN_PRIZES/PREVIEW_PRIZES above:
// own ids ("void" prefix), own coin/star denominations, adds the new
// 'stars' prize type. Everything downstream (Inventory, PrizeModal,
// FullInventoryModal, LiveGiftNotifications, Leaderboard) only ever
// keys off prize.type / prize.value, so it already works for these
// without any changes there.
// ============================================

// ── REAL odds for Void Spin. Decides what the player actually wins. ──
const VOID_SPIN_PRIZES = [];   // filled from the game server (GameAPI.loadConfig) — display rows only

// ── DISPLAY-ONLY odds for Void Spin idle wheel + pre-reveal repaint. ──
const VOID_PREVIEW_PRIZES = [];   // filled from the game server (GameAPI.loadConfig) — display rows only

// Promocodes now live on the game server (managed from its /admin/panel).

// Prizes are created by the game server at win time; the browser never registers them.

// ============================================
// DEPOSIT CONFIGURATION
// ============================================

const DEPOSIT_PACKAGES = {
  stars: [
    { id: 'package_tiny',         amount: 1,     stars: 1,     popular: false },
    { id: 'package_mini',         amount: 25,    stars: 25,    popular: false },
    { id: 'package_small',        amount: 50,    stars: 50,    popular: false },
    { id: 'package_bit',          amount: 75,    stars: 75,    popular: true  },
    { id: 'package_medium',       amount: 100,   stars: 100,   popular: false },
    { id: 'package_biggermedium', amount: 250,   stars: 250,   popular: false },
    { id: 'package_moderate',     amount: 500,   stars: 500,   popular: false },
    { id: 'package_large',        amount: 750,   stars: 750,   popular: false },
    { id: 'package_superlarge',   amount: 1000,  stars: 1000,  popular: false },
    { id: 'package_huge',         amount: 2500,  stars: 2500,  popular: false },
    { id: 'package_xlsize',       amount: 5000,  stars: 5000,  popular: true  },
    { id: 'package_mega',         amount: 7500,  stars: 7500,  popular: false },
    { id: 'package_giant',        amount: 10000, stars: 10000, popular: false }
  ],
  
  ton: [
    { id: 'ton_tiny',   amount: 1.86, stars: 200,   popular: false },
    { id: 'ton_small',  amount: 4.66,   stars: 500,   popular: false },
    { id: 'ton_medium', amount: 9.32,   stars: 1000,  popular: true  },
    { id: 'ton_large',  amount: 23.3,   stars: 2500,  popular: false },
    { id: 'ton_xl',     amount: 46.61,  stars: 5000,  popular: false },
    { id: 'ton_mega',   amount: 93.22,  stars: 10000, popular: true  },
    { id: 'ton_super',  amount: 233.05, stars: 25000, popular: false },
    { id: 'ton_omega',  amount: 466.1,  stars: 50000, popular: false }
  ]
};

// ============================================
// GLOBAL STATE
// ============================================

const STATE = {
  tg: window.Telegram?.WebApp || null,
  userData: null,
  currentPage: 'home',
  userCoins: 0,
  userStars: 0,
  inventoryItems: [],
  notifications: [],
  liveGiftNotifications: [],
  isSpinning: false,
  currentWinningPrize: null,
  scrollPosition: 0,
  scrollSpeed: 1,
  animationFrameId: null,
  lottieInstances: new Map(),
  lastScaleUpdate: 0,
  dailyReadyAt: 0,      // epoch ms when the Daily Gift is available again (from the server)

  // ── Void Spin — entirely separate animation/spin state so the two
  // wheels can never stomp on each other mid-spin. ──
  voidIsSpinning: false,
  voidCurrentWinningPrize: null,
  voidScrollPosition: 0,
  voidScrollSpeed: 1,
  voidAnimationFrameId: null,
  voidLottieInstances: new Map(),
  voidLastScaleUpdate: 0,

  // Furry Spin
  furryIsSpinning: false,
  furryCurrentWinningPrize: null,
  furryScrollPosition: 0,
  furryScrollSpeed: 1,
  furryAnimationFrameId: null,
  furryLottieInstances: new Map(),
  furryLastScaleUpdate: 0,

  // Hex Spin
  hexIsSpinning: false,
  hexCurrentWinningPrize: null,
  hexScrollPosition: 0,
  hexScrollSpeed: 1,
  hexAnimationFrameId: null,
  hexLottieInstances: new Map(),
  hexLastScaleUpdate: 0,

  // Astral Spin
  astralIsSpinning: false,
  astralCurrentWinningPrize: null,
  astralScrollPosition: 0,
  astralScrollSpeed: 1,
  astralAnimationFrameId: null,
  astralLottieInstances: new Map(),
  astralLastScaleUpdate: 0,

  starsSpentTotal: 0,
  voidMultResults: null,
  furryMultResults: null,
  hexMultResults: null,
  astralMultResults: null,

  currentLeaderboardTab: 'coins',
  // Populated from the real /leaderboard endpoint (see Leaderboard.fetchData).
  // Empty until that call resolves — no more placeholder names.
  leaderboardData: { coins: [], stars: [], gifts: [] },
  leaderboardYou: null,     // { coins:{rank,score}, stars:{...}, gifts:{...}, hidden } from the backend
  leaderboardStatus: 'idle', // 'idle' | 'loading' | 'ready' | 'error'
  settings: {
  language: 'en',
  soundEffects: true,
  prizeAlerts: true,
  animationsEnabled: true,
  showInLeaderboard: true,
  shareStats: true
  },
  currentDepositTab: 'stars',
  currentModalPrize: null,
  isClaimingPrize: false,
  currentFilter: 'all',
  isSyncing: false,
  lastBalanceSync: null,
  syncIntervalId: null,

  // Verified once per session so the user isn't re-pinged on every single
  // spin — flip back to false if you'd rather re-check every time.
  subscriptionVerified: false
};

// ============================================
// TRANSLATIONS
// ============================================

const TRANSLATIONS = {
  en: {
    home: 'Home',
    leaderboard: 'Leaderboard',
    inventory: 'Items',
    deposit: 'Deposit',
    settings: 'Settings',
    customizeExperience: 'Customize your experience',
    promocode: 'Promocode',
    language: 'Language',
    appLanguage: 'App Language',
    chooseLanguage: 'Choose your preferred language',
    notifications: 'Notifications',
    display: 'Display',
    privacy: 'Privacy',
    dangerZone: 'Danger Zone',
    topPlayers: 'Leaderboard',
    leaderboardEmpty: 'No one on the board yet — be the first!',
    leaderboardErrorTitle: 'Things went wacky...',
    leaderboardErrorText: "Couldn't display anyone... Please try again later!",

    copyright: '© 2025 Copyright All Rights Reserved',
    liveGifts: 'Live gifts',
    liveGiftsEmpty: 'Gifts you win show up here.',
    more: 'More',

    dailyRewardEyebrow: 'daily reward',
    bagOfLoot: 'Bag of',
    lootHighlight: 'Loot!',
    dailyRewardSub: 'Your free daily gift — open it before midnight.',
    openGift: 'Open Gift',
    dailyReadyIn: 'Ready in',
    dailyOnCooldown: 'Daily gift is on cooldown — {time} left',

    yourItemsEyebrow: 'your items',
    inventoryHighlight: 'Inventory',
    inventorySub: 'Collected prizes and gifts.',
    viewAllItems: 'View All Items',

    premiumSpinEyebrow: 'premium spin',
    voidSpinTitle: 'VOID',
    voidSpinTitleSuffix: 'Spin',
    voidSpinSub: 'Higher stakes — NFTs, Stars, and rare gifts up for grabs.',
    furrySpinTitle: 'FURRY',
    furrySpinSub: 'Instant Ramen, Star Notepad, Calendar and more NFTs, Star prizes and rare gifts. Get fluffy.',
    hexSpinTitle: 'STARRY',
    hexSpinSub: 'Kissed Frog, Voodoo Doll, Vintage Cigar and more NFTs. Big Star prizes under a starry sky.',
    astralSpinTitle: 'ASTRAL',
    astralSpinSub: 'Astral Shard, Lucky Locket, Voodoo Doll and Input Key. The biggest Star prizes. Reach for the stars.',
    newSpinEyebrow: 'new spin',
    eventBadgeAnniversary: '🎉 Anniversary',
    eventBirthdayTitleSm: 'App',
    eventBirthdayTitleLg: 'Birthday!',
    eventBirthdaySub: 'Thank you for an amazing year',
    eventBadgeLimited: 'Limited',
    eventStarsTitle: 'Double Stars weekend',
    eventStarsSub: 'Bonus Stars on every deposit',
    starsWord: 'Stars',
    spinNow: 'Spin Now',

    freeDropsEyebrow: 'free drops every day',
    freeHighlight: 'Telegram',
    channelSuffix: 'Channel',
    channelSub: 'Join to never miss a giveaway or secret code.',
    joinChannel: 'Join Channel',

    exclusiveRewardsEyebrow: 'exclusive rewards',
    enterCodesFor: 'Prizes for',
    prizesHighlight: 'Codes',
    findCodes: 'Find codes in our',
    telegramWord: 'telegram',
    channelWord: 'channel.',
    enterCode: 'Enter Code',

    contactSupport: 'Contact Support',
    settingsAndCodes: 'Settings & Codes',

    updatesEvery24h: 'updates every 24 hours',
    tabCoins: 'Coins',
    tabGifts: 'Gifts',
    tabStars: 'Stars',
    yourRank: 'Your Rank',

    depositEyebrow: 'telegram stars',
    depositTitle: 'Deposit',
    depositSubtitle: 'purchase coins with Telegram Stars',
    tabTelegramStars: 'Telegram Stars',
    tabTonCoin: 'TON Coin',
    tabSell: 'Sell Gifts',
    sellTitle: 'Sell your NFT gifts for Stars',
    sellHowTo: 'Send a collectible to @{relayer} in Telegram. The Stars below are added to your balance automatically.',
    sellOpenRelayer: 'Open @{relayer}',
    sellSearch: 'Search gifts…',
    sellNoResults: 'No gift found',
    sellCount: 'gifts priced',
    sellWord: 'Sell',
    securePayment: 'Secure Payment',
    securePaymentDesc: 'All transactions are processed securely through Telegram. Coins are delivered instantly.',
    purchase: 'Purchase',
    popular: 'Popular',

    promocodePlaceholder: 'Enter promocode...',
    promocodeInfo: 'Enter a valid promocode to receive rewards',

    soundEffects: 'Sound Effects',
    soundEffectsDesc: 'Play sounds when spinning',
    prizeAlerts: 'Prize Alerts',
    prizeAlertsDesc: 'Notify on rare prizes',
    animations: 'Animations',
    animationsDesc: 'Smooth animations and effects',
    showInLeaderboard: 'Show in Leaderboard',
    showInLeaderboardDesc: 'Public stats visibility',
    shareStatistics: 'Share Statistics',
    shareStatisticsDesc: 'Allow sharing stats with friends',

    about: 'About',
    termsOfService: 'Terms of Service',
    termsOfServiceDesc: 'Read our terms and conditions',
    privacyPolicy: 'Privacy Policy',
    privacyPolicyDesc: 'How we handle your data',
    version: 'Version',
    versionDesc: 'App version information',

    resetAllData: 'Reset All Data',
    clearCache: 'Clear Cache',

    backToHome: 'Home',
    whatCanIGet: 'What can I',
    getWord: 'get?',
    spinButton: 'SPIN!',
    coinPrizes: 'Coin Prizes',
    starPrizes: 'Star Prizes',

    youWon: 'you won',
    claim: 'Claim!',

    yourPrize: 'your prize',
    convertToCoins: 'Convert to Coins',
    claimPrize: 'Claim Prize',
    coinsWord: 'Coins',
    coinsValue: 'Coins value',
    starsAddedToBalance: 'Stars added to balance',

    selectLanguage: 'Select Language',

    yourCompleteInventory: 'Your Complete Inventory',
    totalGifts: 'Total Gifts',
    totalValue: 'Total Value',
    rareGifts: 'Rare Gifts',
    filterAll: 'All Gifts',
    filterTelegram: 'Telegram Gifts',
    filterNft: 'NFTs',
    filterRare: 'Rare Only',
    noGiftsYet: 'No Gifts Yet',
    noGiftsYetDesc: 'Win your first gift by spinning the wheel!',

    settingSaved: 'Setting saved',
    languageChanged: 'Language changed',
    paymentSuccessAdding: 'Payment successful! Adding {n} stars…',
    starsAdded: '{n} stars added!',
    notEnoughStars: 'Not enough Stars — need {n} ⭐',
    tabSpent: 'Spent',
    multiResultsTitle: '×{n} spin results',
    multiChanceNft: 'Chance of at least one NFT: {p}%',
    multiChanceGift: 'Chance of at least one gift: {p}%',
    multiCollect: 'Collect',
    multiTotalStars: 'Total Stars won',
    multiSpinsWord: 'Spins',
    spentWord: 'Stars spent',
    creatingInvoice: 'Creating invoice…',
    paymentCancelled: 'Payment cancelled',
    paymentFailed: 'Payment failed. Please try again.',
    claimingGift: 'Claiming your gift…',
    giftSentToTelegram: '{name} sent to your Telegram!',
    failedToClaim: 'Failed to claim: {msg}',
    noPrizeSelected: 'No prize selected',
    telegramUnavailable: 'Telegram unavailable',
    giftMappingError: 'Gift mapping error: {name}',
    cacheCleared: 'Cache cleared',
    telegramWebAppUnavailable: 'Telegram WebApp not available',
    userIdUnavailable: 'User ID not available',
    subscribeEyebrow: 'action required',
    subscribeTitle: 'Subscribe Required',
    subscribeDesc: 'Join our Telegram channel to unlock spinning.',
    subscribeCheckBtn: 'OK',
    subscribeChecking: 'Checking...',
    notSubscribedYet: "You haven't joined yet. Join the channel, then tap OK.",
    subscribeCheckFailed: "Couldn't verify right now — try again.",
    invoiceError: 'Error: {msg}',
    giftSentPopupTitle: 'Gift Sent!',
    giftSentPopupMessage: 'Your {name} gift has been sent to your Telegram account!',
    claimFailedPopupTitle: 'Claim Failed',
    topupRequiredTitle: 'Top-up required',
    topupRequiredPopup: 'To claim an NFT gift you need a fresh top-up of at least {n} Stars each time. Top up, then come back and tap Claim again.',
    topupBtn: 'Top up Stars',
    peerNotFoundPopup: "The gift account doesn't know you yet. Open {relayer}, press Start, then come back and tap Claim again.",
    openRelayerBtn: 'Open {relayer}',
    basicClaimSent: '{name}: will be sent eventually…',
    basicClaimSentPopup: 'Your {name} gift is on its way from @VoidGift_Relayer — it\u2019ll land in your Telegram account shortly.',
    nftClaimQueued: '{name}: will be transferred in the next 48 hours…',
    nftClaimQueuedPopup: 'Your {name} NFT gift is queued for transfer from @VoidGift_Relayer. It\u2019ll arrive within 48 hours — you can track the countdown in your Inventory.',
    nftTransferProcessing: 'Processing…',
    nftTransferComplete: '{name} has been transferred to your Telegram!',
    nftTransferFailed: 'Transfer of {name} failed — check Inventory for details',
    connectWallet: 'Connect Wallet',
    chooseWallet: 'Choose a Wallet',
    noWalletFound: 'No wallet found',
    walletNotConnectedWarning: '⚠️ Connect a wallet to purchase with TON',
    walletNotConnected: 'Not connected',
    walletConnected: 'Wallet Connected',
    tonPurchaseTitle: 'Purchase with TON',
    payWithWallet: 'Pay with this wallet',
    useAnotherWallet: 'Use another wallet',
    connectAWallet: 'Connect a Wallet',
    connectingWallet: 'Waiting for wallet connection…',
    confirmInWalletApp: 'Confirm the payment in your wallet app…',
    waitingTonConfirmation: 'Waiting for on-chain confirmation…',
    tonPaymentSuccessTitle: 'Payment Confirmed',
    tonPaymentSuccessDesc: '{n} stars have been added to your balance.',
    tonPaymentFailedTitle: 'Payment Failed',
    tonConfirmationPendingTitle: 'Still Confirming',
    tonConfirmationPendingDesc: "This can take a few minutes on-chain. Your stars will be added automatically once it's confirmed — no need to keep this open.",
    done: 'Done',
    close: 'Close',
    tryAgain: 'Try Again',
    disconnectWallet: 'Disconnect Wallet',
    disconnected: 'Wallet disconnected',

    promoEnterCode: 'Please enter a promocode',
    promoAlreadyRedeemed: 'Code already redeemed',
    promoInvalid: 'Invalid promocode',
    promoExpired: 'This promocode has expired',
    promoUsedUp: 'This promocode has run out',
    promoRedeemedShort: 'Promocode redeemed!',
    serverUnreachable: 'Can\'t reach the game server — try again',
    promoPaymentRequired: 'Promocodes unlock after you pay {n} TON in the app',
    promoBlocked: 'Promocodes are not available for this account',
    promoRedeemed: '✓ {message} +{coins} coins!',
    promoWelcome: 'Welcome bonus claimed!',
    promoLucky: 'Lucky bonus activated!',
    promoFree: 'Free coins added!',
    promoVoidGift: 'Special gift redeemed!',
    promoSpin2Win: 'Spin bonus unlocked!',

    confirmResetData: '⚠️ Delete ALL data? This cannot be undone.',
    confirmResetType: 'Type "RESET" to confirm:',
    resetCancelled: 'Reset cancelled.',
    allDataReset: 'All data reset!\nReloading…',
    confirmClearCache: 'Clear cache?\n\nYour data will not be affected.'
  },
  ru: {
    home: 'Главная',
    leaderboard: 'Лидеры',
    inventory: 'Вещи',
    deposit: 'Депозит',
    settings: 'Настройки',
    customizeExperience: 'Настройте свой опыт',
    promocode: 'Промокод',
    language: 'Язык',
    appLanguage: 'Язык приложения',
    chooseLanguage: 'Выберите предпочитаемый язык',
    notifications: 'Уведомления',
    display: 'Экран',
    privacy: 'Приватность',
    dangerZone: 'Опасная зона',
    topPlayers: 'Лидеры',
    leaderboardEmpty: 'Тут пока никого нет — станьте первым!',
    leaderboardErrorTitle: 'Что-то пошло не так...',
    leaderboardErrorText: 'Не удалось загрузить список. Попробуйте позже!',

    copyright: '© 2025 Все права защищены',
    liveGifts: 'Подарки в реальном времени',
    liveGiftsEmpty: 'Здесь появятся выигранные вами подарки.',
    more: 'Ещё',

    dailyRewardEyebrow: 'ежедневная награда',
    bagOfLoot: 'Мешок',
    lootHighlight: 'добычи!',
    dailyRewardSub: 'Ваш бесплатный ежедневный подарок — заберите до полуночи.',
    openGift: 'Открыть подарок',
    dailyReadyIn: 'Через',
    dailyOnCooldown: 'Ежедневный подарок на перезарядке — осталось {time}',

    yourItemsEyebrow: 'ваши предметы',
    inventoryHighlight: 'Инвентарь',
    inventorySub: 'Полученные призы и подарки.',
    viewAllItems: 'Все предметы',

    premiumSpinEyebrow: 'премиум-спин',
    voidSpinTitle: 'VOID',
    voidSpinTitleSuffix: 'Spin',
    voidSpinSub: 'Выше ставки — NFT, звёзды и редкие подарки.',
    furrySpinTitle: 'FURRY',
    furrySpinSub: 'Instant Ramen, Star Notepad, Calendar и другие NFT, призы в звёздах и редкие подарки. Пушистая удача.',
    hexSpinTitle: 'STARRY',
    hexSpinSub: 'Kissed Frog, Voodoo Doll, Vintage Cigar и другие NFT. Крупные призы в звёздах. Звёздное небо удачи.',
    astralSpinTitle: 'ASTRAL',
    astralSpinSub: 'Astral Shard, Lucky Locket, Voodoo Doll и Input Key. Самые крупные призы в звёздах. Тянись к звёздам.',
    newSpinEyebrow: 'новый спин',
    eventBadgeAnniversary: '🎉 Годовщина',
    eventBirthdayTitleSm: 'Прил.',
    eventBirthdayTitleLg: 'День рождения!',
    eventBirthdaySub: 'Спасибо за потрясающий год',
    eventBadgeLimited: 'Ограничено',
    eventStarsTitle: 'Выходные двойных звёзд',
    eventStarsSub: 'Бонусные звёзды на каждый депозит',
    starsWord: 'Звёзд',
    spinNow: 'Крутить',

    freeDropsEyebrow: 'бесплатные дропы каждый день',
    freeHighlight: 'FREE',
    channelSuffix: 'Канал',
    channelSub: 'Подпишитесь, чтобы не пропустить розыгрыш или секретный код.',
    joinChannel: 'Подписаться',

    exclusiveRewardsEyebrow: 'эксклюзивные награды',
    enterCodesFor: 'Призы за',
    prizesHighlight: 'коды!',
    findCodes: 'Ищите коды в нашем',
    telegramWord: 'телеграм',
    channelWord: 'канале.',
    enterCode: 'Ввести код',

    contactSupport: 'Связаться с поддержкой',
    settingsAndCodes: 'Настройки и коды',

    updatesEvery24h: 'обновляется каждые 24 часа',
    tabCoins: 'Монеты',
    tabGifts: 'Подарки',
    tabStars: 'Звёзды',
    yourRank: 'Ваш ранг',

    depositEyebrow: 'telegram stars',
    depositTitle: 'Депозит',
    depositSubtitle: 'покупайте монеты за Telegram Stars',
    tabTelegramStars: 'Telegram Stars',
    tabTonCoin: 'TON Coin',
    tabSell: 'Продать',
    sellTitle: 'Продайте NFT-подарки за звёзды',
    sellHowTo: 'Отправьте коллекционный подарок аккаунту @{relayer} в Telegram. Звёзды из списка автоматически зачислятся на баланс.',
    sellOpenRelayer: 'Открыть @{relayer}',
    sellSearch: 'Поиск подарков…',
    sellNoResults: 'Подарок не найден',
    sellCount: 'подарков в списке',
    sellWord: 'Продать',
    securePayment: 'Безопасная оплата',
    securePaymentDesc: 'Все транзакции обрабатываются безопасно через Telegram. Монеты зачисляются мгновенно.',
    purchase: 'Купить',
    popular: 'Популярно',

    promocodePlaceholder: 'Введите промокод...',
    promocodeInfo: 'Введите действующий промокод, чтобы получить награду',

    soundEffects: 'Звуковые эффекты',
    soundEffectsDesc: 'Воспроизводить звуки при вращении',
    prizeAlerts: 'Уведомления о призах',
    prizeAlertsDesc: 'Уведомлять о редких призах',
    animations: 'Анимации',
    animationsDesc: 'Плавные анимации и эффекты',
    showInLeaderboard: 'Показывать в рейтинге',
    showInLeaderboardDesc: 'Видимость публичной статистики',
    shareStatistics: 'Делиться статистикой',
    shareStatisticsDesc: 'Разрешить делиться статистикой с друзьями',

    about: 'О приложении',
    termsOfService: 'Условия использования',
    termsOfServiceDesc: 'Прочитайте наши условия',
    privacyPolicy: 'Политика конфиденциальности',
    privacyPolicyDesc: 'Как мы обрабатываем ваши данные',
    version: 'Версия',
    versionDesc: 'Информация о версии приложения',

    resetAllData: 'Сбросить все данные',
    clearCache: 'Очистить кэш',

    backToHome: 'Домой',
    whatCanIGet: 'Что можно',
    getWord: 'получить?',
    spinButton: 'КРУТИТЬ!',
    coinPrizes: 'Призовые монеты',
    starPrizes: 'Призовые звёзды',

    youWon: 'вы выиграли',
    claim: 'Забрать!',

    yourPrize: 'ваш приз',
    convertToCoins: 'Обменять на монеты',
    claimPrize: 'Забрать приз',
    coinsWord: 'Монет',
    coinsValue: 'монет стоимостью',
    starsAddedToBalance: 'звёзд зачислено на баланс',

    selectLanguage: 'Выберите язык',

    yourCompleteInventory: 'Ваш полный инвентарь',
    totalGifts: 'Всего подарков',
    totalValue: 'Общая стоимость',
    rareGifts: 'Редкие подарки',
    filterAll: 'Все подарки',
    filterTelegram: 'Подарки Telegram',
    filterNft: 'NFT',
    filterRare: 'Только редкие',
    noGiftsYet: 'Пока нет подарков',
    noGiftsYetDesc: 'Выиграйте первый подарок, крутанув колесо!',

    settingSaved: 'Настройка сохранена',
    languageChanged: 'Язык изменён',
    paymentSuccessAdding: 'Оплата прошла успешно! Начисляем {n} звёзд…',
    starsAdded: 'Начислено {n} звёзд!',
    notEnoughStars: 'Недостаточно звёзд — нужно {n} ⭐',
    tabSpent: 'Потрачено',
    multiResultsTitle: 'Результаты ×{n}',
    multiChanceNft: 'Шанс хотя бы одного NFT: {p}%',
    multiChanceGift: 'Шанс хотя бы одного подарка: {p}%',
    multiCollect: 'Забрать',
    multiTotalStars: 'Всего звёзд выиграно',
    multiSpinsWord: 'Спинов',
    spentWord: 'Потрачено звёзд',
    creatingInvoice: 'Создаём счёт…',
    paymentCancelled: 'Оплата отменена',
    paymentFailed: 'Оплата не удалась. Попробуйте снова.',
    claimingGift: 'Забираем ваш подарок…',
    giftSentToTelegram: '{name} отправлен в ваш Telegram!',
    failedToClaim: 'Не удалось забрать: {msg}',
    noPrizeSelected: 'Приз не выбран',
    telegramUnavailable: 'Telegram недоступен',
    giftMappingError: 'Ошибка сопоставления подарка: {name}',
    cacheCleared: 'Кэш очищен',
    telegramWebAppUnavailable: 'Telegram WebApp недоступен',
    userIdUnavailable: 'ID пользователя недоступен',
    subscribeEyebrow: 'требуется действие',
    subscribeTitle: 'Требуется подписка',
    subscribeDesc: 'Подпишитесь на наш Telegram-канал, чтобы открыть вращение.',
    subscribeCheckBtn: 'OK',
    subscribeChecking: 'Проверка...',
    notSubscribedYet: 'Вы ещё не подписались. Подпишитесь на канал и нажмите OK.',
    subscribeCheckFailed: 'Не удалось проверить, попробуйте ещё раз.',
    invoiceError: 'Ошибка: {msg}',
    giftSentPopupTitle: 'Подарок отправлен!',
    giftSentPopupMessage: 'Ваш подарок «{name}» отправлен в ваш аккаунт Telegram!',
    claimFailedPopupTitle: 'Не удалось забрать',
    topupRequiredTitle: 'Нужно пополнение',
    topupRequiredPopup: 'Чтобы забрать NFT-подарок, нужно каждый раз пополнить баланс минимум на {n} Stars. Пополните и вернитесь, затем снова нажмите «Забрать».',
    topupBtn: 'Пополнить Stars',
    peerNotFoundPopup: 'Аккаунт-отправитель пока не знает вас. Откройте {relayer}, нажмите Start, затем вернитесь и снова нажмите «Забрать».',
    openRelayerBtn: 'Открыть {relayer}',

    promoEnterCode: 'Пожалуйста, введите промокод',
    promoAlreadyRedeemed: 'Код уже использован',
    promoInvalid: 'Неверный промокод',
    promoExpired: 'Срок действия промокода истёк',
    promoUsedUp: 'Промокод закончился',
    promoRedeemedShort: 'Промокод активирован!',
    serverUnreachable: 'Нет связи с игровым сервером — попробуйте ещё раз',
    promoPaymentRequired: 'Промокоды открываются после оплаты {n} TON в приложении',
    promoBlocked: 'Промокоды недоступны для этого аккаунта',
    promoRedeemed: '✓ {message} +{coins} монет!',
    promoWelcome: 'Приветственный бонус получен!',
    promoLucky: 'Счастливый бонус активирован!',
    promoFree: 'Бесплатные монеты начислены!',
    promoVoidGift: 'Особый подарок получен!',
    promoSpin2Win: 'Бонус спина разблокирован!',

    confirmResetData: '⚠️ Удалить ВСЕ данные? Это действие необратимо.',
    confirmResetType: 'Введите "RESET" для подтверждения:',
    resetCancelled: 'Сброс отменён.',
    allDataReset: 'Все данные сброшены!\nПерезагрузка…',
    confirmClearCache: 'Очистить кэш?\n\nВаши данные не будут затронуты.'
  },
  es: {
    home: 'Inicio',
    leaderboard: 'Clasificación',
    inventory: 'Objetos',
    deposit: 'Depósito',
    settings: 'Configuración',
    customizeExperience: 'Personaliza tu experiencia',
    promocode: 'Código promocional',
    language: 'Idioma',
    appLanguage: 'Idioma de la app',
    chooseLanguage: 'Elige tu idioma preferido',
    notifications: 'Notificaciones',
    display: 'Pantalla',
    privacy: 'Privacidad',
    dangerZone: 'Zona de peligro',
    topPlayers: 'Clasificación',
    leaderboardEmpty: 'Todavía no hay nadie — ¡sé el primero!',
    leaderboardErrorTitle: 'Algo salió mal...',
    leaderboardErrorText: 'No se pudo cargar la lista. ¡Inténtalo más tarde!',

    copyright: '© 2025 Todos los derechos reservados',
    liveGifts: 'Regalos en vivo',
    liveGiftsEmpty: 'Los regalos que ganes aparecerán aquí.',
    more: 'Más',

    dailyRewardEyebrow: 'recompensa diaria',
    bagOfLoot: 'Bolsa de',
    lootHighlight: 'botín!',
    dailyRewardSub: 'Tu regalo diario gratuito — ábrelo antes de medianoche.',
    openGift: 'Abrir regalo',
    dailyReadyIn: 'Listo en',
    dailyOnCooldown: 'El regalo diario está en espera — faltan {time}',

    yourItemsEyebrow: 'tus objetos',
    inventoryHighlight: 'Inventario',
    inventorySub: 'Premios y regalos recolectados.',
    viewAllItems: 'Ver todos los objetos',

    premiumSpinEyebrow: 'giro premium',
    voidSpinTitle: 'VOID',
    voidSpinTitleSuffix: 'Spin',
    voidSpinSub: 'Apuestas más altas — NFTs, Stars y regalos raros en juego.',
    furrySpinTitle: 'FURRY',
    furrySpinSub: 'Instant Ramen, Star Notepad, Calendar y más NFTs, premios en Estrellas y regalos raros. ¡A peludear!',
    hexSpinTitle: 'STARRY',
    hexSpinSub: 'Kissed Frog, Voodoo Doll, Vintage Cigar y más NFTs. Grandes premios en Estrellas. Bajo un cielo estrellado.',
    astralSpinTitle: 'ASTRAL',
    astralSpinSub: 'Astral Shard, Lucky Locket, Voodoo Doll e Input Key. Los mayores premios en Estrellas. Alcanza las estrellas.',
    newSpinEyebrow: 'nuevo giro',
    eventBadgeAnniversary: '🎉 Aniversario',
    eventBirthdayTitleSm: 'App',
    eventBirthdayTitleLg: '¡Cumpleaños!',
    eventBirthdaySub: 'Gracias por un año increíble',
    eventBadgeLimited: 'Limitado',
    eventStarsTitle: 'Fin de semana de Estrellas dobles',
    eventStarsSub: 'Estrellas de bono en cada depósito',
    starsWord: 'Stars',
    spinNow: 'Girar ahora',

    freeDropsEyebrow: 'drops gratis cada día',
    freeHighlight: 'GRATIS',
    channelSuffix: 'Canal',
    channelSub: 'Únete para no perderte ningún sorteo o código secreto.',
    joinChannel: 'Unirse al canal',

    exclusiveRewardsEyebrow: 'recompensas exclusivas',
    enterCodesFor: 'Premios por',
    prizesHighlight: 'códigos!',
    findCodes: 'Encuentra códigos en nuestro',
    telegramWord: 'telegram',
    channelWord: 'canal.',
    enterCode: 'Introducir código',

    contactSupport: 'Contactar soporte',
    settingsAndCodes: 'Configuración y códigos',

    updatesEvery24h: 'se actualiza cada 24 horas',
    tabCoins: 'Monedas',
    tabGifts: 'Regalos',
    tabStars: 'Stars',
    yourRank: 'Tu posición',

    depositEyebrow: 'telegram stars',
    depositTitle: 'Depósito',
    depositSubtitle: 'compra monedas con Telegram Stars',
    tabTelegramStars: 'Telegram Stars',
    tabTonCoin: 'TON Coin',
    tabSell: 'Vender',
    sellTitle: 'Vende tus regalos NFT por Stars',
    sellHowTo: 'Envía un coleccionable a @{relayer} en Telegram. Las Stars de abajo se añaden a tu saldo automáticamente.',
    sellOpenRelayer: 'Abrir @{relayer}',
    sellSearch: 'Buscar regalos…',
    sellNoResults: 'No se encontró ningún regalo',
    sellCount: 'regalos con precio',
    sellWord: 'Vender',
    securePayment: 'Pago seguro',
    securePaymentDesc: 'Todas las transacciones se procesan de forma segura a través de Telegram. Las monedas se entregan al instante.',
    purchase: 'Comprar',
    popular: 'Popular',

    promocodePlaceholder: 'Introduce el código promocional...',
    promocodeInfo: 'Introduce un código promocional válido para recibir recompensas',

    soundEffects: 'Efectos de sonido',
    soundEffectsDesc: 'Reproducir sonidos al girar',
    prizeAlerts: 'Alertas de premios',
    prizeAlertsDesc: 'Notificar sobre premios raros',
    animations: 'Animaciones',
    animationsDesc: 'Animaciones y efectos suaves',
    showInLeaderboard: 'Mostrar en la clasificación',
    showInLeaderboardDesc: 'Visibilidad de estadísticas públicas',
    shareStatistics: 'Compartir estadísticas',
    shareStatisticsDesc: 'Permitir compartir estadísticas con amigos',

    about: 'Acerca de',
    termsOfService: 'Términos de servicio',
    termsOfServiceDesc: 'Lee nuestros términos y condiciones',
    privacyPolicy: 'Política de privacidad',
    privacyPolicyDesc: 'Cómo manejamos tus datos',
    version: 'Versión',
    versionDesc: 'Información de la versión de la app',

    resetAllData: 'Restablecer todos los datos',
    clearCache: 'Borrar caché',

    backToHome: 'Inicio',
    whatCanIGet: 'Qué puedo',
    getWord: 'obtener?',
    spinButton: '¡GIRAR!',
    coinPrizes: 'Premios en monedas',
    starPrizes: 'Premios en Stars',

    youWon: 'ganaste',
    claim: '¡Reclamar!',

    yourPrize: 'tu premio',
    convertToCoins: 'Convertir a monedas',
    claimPrize: 'Reclamar premio',
    coinsWord: 'Monedas',
    coinsValue: 'monedas de valor',
    starsAddedToBalance: 'Stars añadidas al saldo',

    selectLanguage: 'Seleccionar idioma',

    yourCompleteInventory: 'Tu inventario completo',
    totalGifts: 'Regalos totales',
    totalValue: 'Valor total',
    rareGifts: 'Regalos raros',
    filterAll: 'Todos los regalos',
    filterTelegram: 'Regalos de Telegram',
    filterNft: 'NFTs',
    filterRare: 'Solo raros',
    noGiftsYet: 'Aún no hay regalos',
    noGiftsYetDesc: '¡Gana tu primer regalo girando la rueda!',

    settingSaved: 'Ajuste guardado',
    languageChanged: 'Idioma cambiado',
    paymentSuccessAdding: '¡Pago exitoso! Añadiendo {n} stars…',
    starsAdded: '¡{n} stars añadidas!',
    notEnoughStars: 'No tienes suficientes Stars — necesitas {n} ⭐',
    tabSpent: 'Gastado',
    multiResultsTitle: 'Resultados ×{n}',
    multiChanceNft: 'Probabilidad de al menos un NFT: {p}%',
    multiChanceGift: 'Probabilidad de al menos un regalo: {p}%',
    multiCollect: 'Recoger',
    multiTotalStars: 'Total de Stars ganadas',
    multiSpinsWord: 'Giros',
    spentWord: 'Stars gastadas',
    creatingInvoice: 'Creando factura…',
    paymentCancelled: 'Pago cancelado',
    paymentFailed: 'El pago falló. Inténtalo de nuevo.',
    claimingGift: 'Reclamando tu regalo…',
    giftSentToTelegram: '¡{name} enviado a tu Telegram!',
    failedToClaim: 'No se pudo reclamar: {msg}',
    noPrizeSelected: 'Ningún premio seleccionado',
    telegramUnavailable: 'Telegram no disponible',
    giftMappingError: 'Error de mapeo del regalo: {name}',
    cacheCleared: 'Caché borrada',
    telegramWebAppUnavailable: 'Telegram WebApp no disponible',
    userIdUnavailable: 'ID de usuario no disponible',
    subscribeEyebrow: 'acción requerida',
    subscribeTitle: 'Suscripción requerida',
    subscribeDesc: 'Únete a nuestro canal de Telegram para poder girar.',
    subscribeCheckBtn: 'OK',
    subscribeChecking: 'Comprobando...',
    notSubscribedYet: 'Aún no te has unido. Únete al canal y pulsa OK.',
    subscribeCheckFailed: 'No se pudo verificar, inténtalo de nuevo.',
    invoiceError: 'Error: {msg}',
    giftSentPopupTitle: '¡Regalo enviado!',
    giftSentPopupMessage: '¡Tu regalo {name} ha sido enviado a tu cuenta de Telegram!',
    claimFailedPopupTitle: 'Error al reclamar',
    topupRequiredTitle: 'Recarga necesaria',
    topupRequiredPopup: 'Para reclamar un regalo NFT necesitas una recarga nueva de al menos {n} Stars cada vez. Recarga y vuelve a pulsar Reclamar.',
    topupBtn: 'Recargar Stars',
    peerNotFoundPopup: 'La cuenta de regalos aún no te conoce. Abre {relayer}, pulsa Start y vuelve para reclamar de nuevo.',
    openRelayerBtn: 'Abrir {relayer}',

    promoEnterCode: 'Introduce un código promocional',
    promoAlreadyRedeemed: 'Código ya canjeado',
    promoInvalid: 'Código promocional inválido',
    promoExpired: 'Este código ha caducado',
    promoUsedUp: 'Este código se ha agotado',
    promoRedeemedShort: '¡Código canjeado!',
    serverUnreachable: 'No se puede conectar con el servidor — inténtalo de nuevo',
    promoPaymentRequired: 'Los códigos se desbloquean tras pagar {n} TON en la app',
    promoBlocked: 'Los códigos no están disponibles para esta cuenta',
    promoRedeemed: '✓ {message} +{coins} monedas!',
    promoWelcome: '¡Bono de bienvenida reclamado!',
    promoLucky: '¡Bono de la suerte activado!',
    promoFree: '¡Monedas gratis añadidas!',
    promoVoidGift: '¡Regalo especial canjeado!',
    promoSpin2Win: '¡Bono de giro desbloqueado!',

    confirmResetData: '⚠️ ¿Eliminar TODOS los datos? Esto no se puede deshacer.',
    confirmResetType: 'Escribe "RESET" para confirmar:',
    resetCancelled: 'Restablecimiento cancelado.',
    allDataReset: '¡Todos los datos restablecidos!\nRecargando…',
    confirmClearCache: '¿Borrar caché?\n\nTus datos no se verán afectados.'
  },
  fr: {
    home: 'Accueil',
    leaderboard: 'Classement',
    inventory: 'Objets',
    deposit: 'Dépôt',
    settings: 'Paramètres',
    customizeExperience: 'Personnalisez votre expérience',
    promocode: 'Code promo',
    language: 'Langue',
    appLanguage: "Langue de l'application",
    chooseLanguage: 'Choisissez votre langue préférée',
    notifications: 'Notifications',
    display: 'Affichage',
    privacy: 'Confidentialité',
    dangerZone: 'Zone dangereuse',
    topPlayers: 'Classement',
    leaderboardEmpty: "Personne pour l'instant — soyez le premier !",
    leaderboardErrorTitle: 'Un truc a mal tourné...',
    leaderboardErrorText: "Impossible d'afficher le classement... Réessayez plus tard !",

    copyright: '© 2025 Tous droits réservés',
    liveGifts: 'Cadeaux en direct',
    liveGiftsEmpty: 'Les cadeaux que vous gagnez apparaissent ici.',
    more: 'Plus',

    dailyRewardEyebrow: 'récompense quotidienne',
    bagOfLoot: 'Sac de',
    lootHighlight: 'butin!',
    dailyRewardSub: 'Votre cadeau quotidien gratuit — ouvrez-le avant minuit.',
    openGift: 'Ouvrir le cadeau',
    dailyReadyIn: 'Prêt dans',
    dailyOnCooldown: 'Le cadeau quotidien est en recharge — encore {time}',

    yourItemsEyebrow: 'vos objets',
    inventoryHighlight: 'Inventaire',
    inventorySub: 'Prix et cadeaux collectés.',
    viewAllItems: 'Voir tous les objets',

    premiumSpinEyebrow: 'spin premium',
    voidSpinTitle: 'VOID',
    voidSpinTitleSuffix: 'Spin',
    voidSpinSub: 'Enjeux plus élevés — NFT, Stars et cadeaux rares à gagner.',
    furrySpinTitle: 'FURRY',
    furrySpinSub: 'Instant Ramen, Star Notepad, Calendar et d\'autres NFT, prix en Étoiles et cadeaux rares. Version peluche.',
    hexSpinTitle: 'STARRY',
    hexSpinSub: 'Kissed Frog, Voodoo Doll, Vintage Cigar et d\'autres NFT. Gros prix en Étoiles. Sous un ciel étoilé.',
    astralSpinTitle: 'ASTRAL',
    astralSpinSub: 'Astral Shard, Lucky Locket, Voodoo Doll et Input Key. Les plus gros prix en Étoiles. Visez les étoiles.',
    newSpinEyebrow: 'nouveau spin',
    eventBadgeAnniversary: '🎉 Anniversaire',
    eventBirthdayTitleSm: 'App',
    eventBirthdayTitleLg: 'Anniversaire !',
    eventBirthdaySub: 'Merci pour une année incroyable',
    eventBadgeLimited: 'Limité',
    eventStarsTitle: 'Week-end Étoiles doublées',
    eventStarsSub: 'Étoiles bonus sur chaque dépôt',
    starsWord: 'Stars',
    spinNow: 'Tourner',

    freeDropsEyebrow: 'drops gratuits chaque jour',
    freeHighlight: 'GRATUIT',
    channelSuffix: 'Chaîne',
    channelSub: 'Rejoignez pour ne jamais manquer un tirage ou un code secret.',
    joinChannel: 'Rejoindre la chaîne',

    exclusiveRewardsEyebrow: 'récompenses exclusives',
    enterCodesFor: 'Des prix avec des',
    prizesHighlight: 'codes!',
    findCodes: 'Trouvez des codes sur notre',
    telegramWord: 'telegram',
    channelWord: 'chaîne.',
    enterCode: 'Entrer le code',

    contactSupport: 'Contacter le support',
    settingsAndCodes: 'Paramètres et codes',

    updatesEvery24h: 'mis à jour toutes les 24 heures',
    tabCoins: 'Pièces',
    tabGifts: 'Cadeaux',
    tabStars: 'Stars',
    yourRank: 'Votre rang',

    depositEyebrow: 'telegram stars',
    depositTitle: 'Dépôt',
    depositSubtitle: 'achetez des pièces avec des Telegram Stars',
    tabTelegramStars: 'Telegram Stars',
    tabTonCoin: 'TON Coin',
    tabSell: 'Vendre',
    sellTitle: 'Vendez vos cadeaux NFT contre des Étoiles',
    sellHowTo: 'Envoyez un objet de collection à @{relayer} sur Telegram. Les Étoiles ci-dessous sont ajoutées automatiquement à votre solde.',
    sellOpenRelayer: 'Ouvrir @{relayer}',
    sellSearch: 'Rechercher un cadeau…',
    sellNoResults: 'Aucun cadeau trouvé',
    sellCount: 'cadeaux listés',
    sellWord: 'Vendre',
    securePayment: 'Paiement sécurisé',
    securePaymentDesc: 'Toutes les transactions sont traitées en toute sécurité via Telegram. Les pièces sont livrées instantanément.',
    purchase: 'Acheter',
    popular: 'Populaire',

    promocodePlaceholder: 'Entrez le code promo...',
    promocodeInfo: 'Entrez un code promo valide pour recevoir des récompenses',

    soundEffects: 'Effets sonores',
    soundEffectsDesc: 'Jouer des sons lors du spin',
    prizeAlerts: 'Alertes de prix',
    prizeAlertsDesc: 'Notifier pour les prix rares',
    animations: 'Animations',
    animationsDesc: 'Animations et effets fluides',
    showInLeaderboard: 'Afficher dans le classement',
    showInLeaderboardDesc: 'Visibilité des statistiques publiques',
    shareStatistics: 'Partager les statistiques',
    shareStatisticsDesc: 'Autoriser le partage des statistiques avec des amis',

    about: 'À propos',
    termsOfService: "Conditions d'utilisation",
    termsOfServiceDesc: 'Lisez nos conditions générales',
    privacyPolicy: 'Politique de confidentialité',
    privacyPolicyDesc: 'Comment nous traitons vos données',
    version: 'Version',
    versionDesc: "Informations sur la version de l'application",

    resetAllData: 'Réinitialiser toutes les données',
    clearCache: 'Vider le cache',

    backToHome: 'Accueil',
    whatCanIGet: 'Que puis-je',
    getWord: 'gagner?',
    spinButton: 'SPIN!',
    coinPrizes: 'Prix en pièces',
    starPrizes: 'Prix en Stars',

    youWon: 'vous avez gagné',
    claim: 'Réclamer!',

    yourPrize: 'votre prix',
    convertToCoins: 'Convertir en pièces',
    claimPrize: 'Réclamer le prix',
    coinsWord: 'Pièces',
    coinsValue: 'pièces de valeur',
    starsAddedToBalance: 'Stars ajoutées au solde',

    selectLanguage: 'Sélectionner la langue',

    yourCompleteInventory: 'Votre inventaire complet',
    totalGifts: 'Cadeaux totaux',
    totalValue: 'Valeur totale',
    rareGifts: 'Cadeaux rares',
    filterAll: 'Tous les cadeaux',
    filterTelegram: 'Cadeaux Telegram',
    filterNft: 'NFT',
    filterRare: 'Rares uniquement',
    noGiftsYet: 'Pas encore de cadeaux',
    noGiftsYetDesc: 'Gagnez votre premier cadeau en tournant la roue !',

    settingSaved: 'Paramètre enregistré',
    languageChanged: 'Langue changée',
    paymentSuccessAdding: 'Paiement réussi ! Ajout de {n} stars…',
    starsAdded: '{n} stars ajoutées !',
    notEnoughStars: 'Pas assez de Stars — {n} nécessaires ⭐',
    tabSpent: 'Dépensé',
    multiResultsTitle: 'Résultats ×{n}',
    multiChanceNft: 'Chance d\'obtenir au moins un NFT : {p} %',
    multiChanceGift: 'Chance d\'obtenir au moins un cadeau : {p} %',
    multiCollect: 'Récupérer',
    multiTotalStars: 'Total d\'Étoiles gagnées',
    multiSpinsWord: 'Tours',
    spentWord: 'Étoiles dépensées',
    creatingInvoice: 'Création de la facture…',
    paymentCancelled: 'Paiement annulé',
    paymentFailed: 'Le paiement a échoué. Veuillez réessayer.',
    claimingGift: 'Réclamation de votre cadeau…',
    giftSentToTelegram: '{name} envoyé sur votre Telegram !',
    failedToClaim: 'Échec de la réclamation : {msg}',
    noPrizeSelected: 'Aucun prix sélectionné',
    telegramUnavailable: 'Telegram indisponible',
    giftMappingError: 'Erreur de mappage du cadeau : {name}',
    cacheCleared: 'Cache vidé',
    telegramWebAppUnavailable: 'Telegram WebApp non disponible',
    userIdUnavailable: "ID utilisateur non disponible",
    subscribeEyebrow: 'action requise',
    subscribeTitle: 'Abonnement requis',
    subscribeDesc: 'Rejoignez notre chaîne Telegram pour débloquer la roue.',
    subscribeCheckBtn: 'OK',
    subscribeChecking: 'Vérification...',
    notSubscribedYet: "Vous n'avez pas encore rejoint. Rejoignez la chaîne puis appuyez sur OK.",
    subscribeCheckFailed: "Vérification impossible, réessayez.",
    invoiceError: 'Erreur : {msg}',
    giftSentPopupTitle: 'Cadeau envoyé !',
    giftSentPopupMessage: 'Votre cadeau {name} a été envoyé sur votre compte Telegram !',
    claimFailedPopupTitle: 'Échec de la réclamation',
    topupRequiredTitle: 'Recharge requise',
    topupRequiredPopup: "Pour réclamer un cadeau NFT, il faut une nouvelle recharge d'au moins {n} Stars à chaque fois. Rechargez puis réessayez.",
    topupBtn: 'Recharger des Stars',
    peerNotFoundPopup: "Le compte d'envoi ne vous connaît pas encore. Ouvrez {relayer}, appuyez sur Start, puis revenez réclamer à nouveau.",
    openRelayerBtn: 'Ouvrir {relayer}',

    promoEnterCode: 'Veuillez entrer un code promo',
    promoAlreadyRedeemed: 'Code déjà utilisé',
    promoInvalid: 'Code promo invalide',
    promoExpired: 'Ce code promo a expiré',
    promoUsedUp: 'Ce code promo est épuisé',
    promoRedeemedShort: 'Code promo utilisé !',
    serverUnreachable: 'Serveur injoignable — réessayez',
    promoPaymentRequired: 'Les codes promo se débloquent après un paiement de {n} TON dans l\'app',
    promoBlocked: 'Les codes promo ne sont pas disponibles pour ce compte',
    promoRedeemed: '✓ {message} +{coins} pièces !',
    promoWelcome: 'Bonus de bienvenue réclamé !',
    promoLucky: 'Bonus chanceux activé !',
    promoFree: 'Pièces gratuites ajoutées !',
    promoVoidGift: 'Cadeau spécial échangé !',
    promoSpin2Win: 'Bonus de spin débloqué !',

    confirmResetData: '⚠️ Supprimer TOUTES les données ? Ceci est irréversible.',
    confirmResetType: 'Tapez "RESET" pour confirmer :',
    resetCancelled: 'Réinitialisation annulée.',
    allDataReset: 'Toutes les données réinitialisées !\nRechargement…',
    confirmClearCache: 'Vider le cache ?\n\nVos données ne seront pas affectées.'
  },
  de: {
    home: 'Start',
    leaderboard: 'Bestenliste',
    inventory: 'Gegenstände',
    deposit: 'Einzahlung',
    settings: 'Einstellungen',
    customizeExperience: 'Passe deine Erfahrung an',
    promocode: 'Gutscheincode',
    language: 'Sprache',
    appLanguage: 'App-Sprache',
    chooseLanguage: 'Wähle deine bevorzugte Sprache',
    notifications: 'Benachrichtigungen',
    display: 'Anzeige',
    privacy: 'Datenschutz',
    dangerZone: 'Gefahrenzone',
    topPlayers: 'Bestenliste',
    leaderboardEmpty: 'Noch niemand hier — sei der Erste!',
    leaderboardErrorTitle: 'Da ist was schiefgelaufen...',
    leaderboardErrorText: 'Die Liste konnte nicht geladen werden... Bitte später erneut versuchen!',

    copyright: '© 2025 Alle Rechte vorbehalten',
    liveGifts: 'Live-Geschenke',
    liveGiftsEmpty: 'Gewonnene Geschenke erscheinen hier.',
    more: 'Mehr',

    dailyRewardEyebrow: 'tägliche Belohnung',
    bagOfLoot: 'Beutel voller',
    lootHighlight: 'Beute!',
    dailyRewardSub: 'Dein kostenloses tägliches Geschenk — öffne es vor Mitternacht.',
    openGift: 'Geschenk öffnen',
    dailyReadyIn: 'Bereit in',
    dailyOnCooldown: 'Tägliches Geschenk lädt noch — noch {time}',

    yourItemsEyebrow: 'deine Gegenstände',
    inventoryHighlight: 'Inventar',
    inventorySub: 'Gesammelte Preise und Geschenke.',
    viewAllItems: 'Alle Gegenstände ansehen',

    premiumSpinEyebrow: 'Premium-Spin',
    voidSpinTitle: 'VOID',
    voidSpinTitleSuffix: 'Spin',
    voidSpinSub: 'Höhere Einsätze — NFTs, Stars und seltene Geschenke zu gewinnen.',
    furrySpinTitle: 'FURRY',
    furrySpinSub: 'Instant Ramen, Star Notepad, Calendar und weitere NFTs, Stern-Preise und seltene Geschenke. Flauschig!',
    hexSpinTitle: 'STARRY',
    hexSpinSub: 'Kissed Frog, Voodoo Doll, Vintage Cigar und weitere NFTs. Große Stern-Preise. Unter dem Sternenhimmel.',
    astralSpinTitle: 'ASTRAL',
    astralSpinSub: 'Astral Shard, Lucky Locket, Voodoo Doll und Input Key. Die größten Stern-Preise. Greif nach den Sternen.',
    newSpinEyebrow: 'neuer Spin',
    eventBadgeAnniversary: '🎉 Jubiläum',
    eventBirthdayTitleSm: 'App',
    eventBirthdayTitleLg: 'Geburtstag!',
    eventBirthdaySub: 'Danke für ein tolles Jahr',
    eventBadgeLimited: 'Limitiert',
    eventStarsTitle: 'Doppelte-Sterne-Wochenende',
    eventStarsSub: 'Bonus-Sterne bei jeder Einzahlung',
    starsWord: 'Stars',
    spinNow: 'Jetzt drehen',

    freeDropsEyebrow: 'kostenlose Drops jeden Tag',
    freeHighlight: 'GRATIS',
    channelSuffix: 'Kanal',
    channelSub: 'Trete bei, um kein Gewinnspiel oder Geheimcode zu verpassen.',
    joinChannel: 'Kanal beitreten',

    exclusiveRewardsEyebrow: 'exklusive Belohnungen',
    enterCodesFor: 'Preise für',
    prizesHighlight: 'Codes!',
    findCodes: 'Codes findest du in unserem',
    telegramWord: 'telegram',
    channelWord: 'Kanal.',
    enterCode: 'Code eingeben',

    contactSupport: 'Support kontaktieren',
    settingsAndCodes: 'Einstellungen & Codes',

    updatesEvery24h: 'aktualisiert alle 24 Stunden',
    tabCoins: 'Münzen',
    tabGifts: 'Geschenke',
    tabStars: 'Stars',
    yourRank: 'Dein Rang',

    depositEyebrow: 'telegram stars',
    depositTitle: 'Einzahlung',
    depositSubtitle: 'kaufe Münzen mit Telegram Stars',
    tabTelegramStars: 'Telegram Stars',
    tabTonCoin: 'TON Coin',
    tabSell: 'Verkaufen',
    sellTitle: 'Verkaufe deine NFT-Geschenke für Stars',
    sellHowTo: 'Sende ein Sammlerstück an @{relayer} in Telegram. Die Stars unten werden automatisch deinem Guthaben gutgeschrieben.',
    sellOpenRelayer: '@{relayer} öffnen',
    sellSearch: 'Geschenke suchen…',
    sellNoResults: 'Kein Geschenk gefunden',
    sellCount: 'Geschenke gelistet',
    sellWord: 'Verkaufen',
    securePayment: 'Sichere Zahlung',
    securePaymentDesc: 'Alle Transaktionen werden sicher über Telegram abgewickelt. Münzen werden sofort gutgeschrieben.',
    purchase: 'Kaufen',
    popular: 'Beliebt',

    promocodePlaceholder: 'Gutscheincode eingeben...',
    promocodeInfo: 'Gib einen gültigen Gutscheincode ein, um Belohnungen zu erhalten',

    soundEffects: 'Soundeffekte',
    soundEffectsDesc: 'Sounds beim Drehen abspielen',
    prizeAlerts: 'Preisbenachrichtigungen',
    prizeAlertsDesc: 'Bei seltenen Preisen benachrichtigen',
    animations: 'Animationen',
    animationsDesc: 'Sanfte Animationen und Effekte',
    showInLeaderboard: 'In der Bestenliste anzeigen',
    showInLeaderboardDesc: 'Sichtbarkeit öffentlicher Statistiken',
    shareStatistics: 'Statistiken teilen',
    shareStatisticsDesc: 'Erlauben, Statistiken mit Freunden zu teilen',

    about: 'Über',
    termsOfService: 'Nutzungsbedingungen',
    termsOfServiceDesc: 'Lies unsere Allgemeinen Geschäftsbedingungen',
    privacyPolicy: 'Datenschutzrichtlinie',
    privacyPolicyDesc: 'Wie wir mit deinen Daten umgehen',
    version: 'Version',
    versionDesc: 'App-Versionsinformationen',

    resetAllData: 'Alle Daten zurücksetzen',
    clearCache: 'Cache leeren',

    backToHome: 'Start',
    whatCanIGet: 'Was kann ich',
    getWord: 'gewinnen?',
    spinButton: 'DREHEN!',
    coinPrizes: 'Münzpreise',
    starPrizes: 'Star-Preise',

    youWon: 'du hast gewonnen',
    claim: 'Abholen!',

    yourPrize: 'dein Preis',
    convertToCoins: 'In Münzen umwandeln',
    claimPrize: 'Preis abholen',
    coinsWord: 'Münzen',
    coinsValue: 'Münzen Wert',
    starsAddedToBalance: 'Stars zum Guthaben hinzugefügt',

    selectLanguage: 'Sprache auswählen',

    yourCompleteInventory: 'Dein komplettes Inventar',
    totalGifts: 'Geschenke gesamt',
    totalValue: 'Gesamtwert',
    rareGifts: 'Seltene Geschenke',
    filterAll: 'Alle Geschenke',
    filterTelegram: 'Telegram-Geschenke',
    filterNft: 'NFTs',
    filterRare: 'Nur Seltene',
    noGiftsYet: 'Noch keine Geschenke',
    noGiftsYetDesc: 'Gewinne dein erstes Geschenk, indem du das Rad drehst!',

    settingSaved: 'Einstellung gespeichert',
    languageChanged: 'Sprache geändert',
    paymentSuccessAdding: 'Zahlung erfolgreich! {n} Stars werden hinzugefügt…',
    starsAdded: '{n} Stars hinzugefügt!',
    notEnoughStars: 'Nicht genug Stars — {n} benötigt ⭐',
    tabSpent: 'Ausgegeben',
    multiResultsTitle: 'Ergebnisse ×{n}',
    multiChanceNft: 'Chance auf mindestens ein NFT: {p} %',
    multiChanceGift: 'Chance auf mindestens ein Geschenk: {p} %',
    multiCollect: 'Einsammeln',
    multiTotalStars: 'Gewonnene Stars gesamt',
    multiSpinsWord: 'Drehs',
    spentWord: 'Ausgegebene Stars',
    creatingInvoice: 'Rechnung wird erstellt…',
    paymentCancelled: 'Zahlung abgebrochen',
    paymentFailed: 'Zahlung fehlgeschlagen. Bitte erneut versuchen.',
    claimingGift: 'Dein Geschenk wird abgeholt…',
    giftSentToTelegram: '{name} an dein Telegram gesendet!',
    failedToClaim: 'Abholen fehlgeschlagen: {msg}',
    noPrizeSelected: 'Kein Preis ausgewählt',
    telegramUnavailable: 'Telegram nicht verfügbar',
    giftMappingError: 'Geschenk-Zuordnungsfehler: {name}',
    cacheCleared: 'Cache geleert',
    telegramWebAppUnavailable: 'Telegram WebApp nicht verfügbar',
    userIdUnavailable: 'Benutzer-ID nicht verfügbar',
    subscribeEyebrow: 'aktion erforderlich',
    subscribeTitle: 'Abo erforderlich',
    subscribeDesc: 'Tritt unserem Telegram-Kanal bei, um das Drehen freizuschalten.',
    subscribeCheckBtn: 'OK',
    subscribeChecking: 'Wird geprüft...',
    notSubscribedYet: 'Du bist noch nicht beigetreten. Tritt dem Kanal bei und tippe auf OK.',
    subscribeCheckFailed: 'Prüfung fehlgeschlagen, versuch es erneut.',
    invoiceError: 'Fehler: {msg}',
    giftSentPopupTitle: 'Geschenk gesendet!',
    giftSentPopupMessage: 'Dein {name}-Geschenk wurde an dein Telegram-Konto gesendet!',
    claimFailedPopupTitle: 'Abholen fehlgeschlagen',
    topupRequiredTitle: 'Aufladung nötig',
    topupRequiredPopup: 'Für ein NFT-Geschenk brauchst du jedes Mal eine neue Aufladung von mindestens {n} Stars. Lade auf und tippe danach erneut auf Abholen.',
    topupBtn: 'Stars aufladen',
    peerNotFoundPopup: 'Das Geschenk-Konto kennt dich noch nicht. Öffne {relayer}, tippe auf Start und versuche das Abholen danach erneut.',
    openRelayerBtn: '{relayer} öffnen',

    promoEnterCode: 'Bitte gib einen Gutscheincode ein',
    promoAlreadyRedeemed: 'Code bereits eingelöst',
    promoInvalid: 'Ungültiger Gutscheincode',
    promoExpired: 'Dieser Promocode ist abgelaufen',
    promoUsedUp: 'Dieser Promocode ist aufgebraucht',
    promoRedeemedShort: 'Promocode eingelöst!',
    serverUnreachable: 'Spielserver nicht erreichbar — bitte erneut versuchen',
    promoPaymentRequired: 'Promocodes werden nach einer Zahlung von {n} TON in der App freigeschaltet',
    promoBlocked: 'Promocodes sind für dieses Konto nicht verfügbar',
    promoRedeemed: '✓ {message} +{coins} Münzen!',
    promoWelcome: 'Willkommensbonus erhalten!',
    promoLucky: 'Glücksbonus aktiviert!',
    promoFree: 'Kostenlose Münzen hinzugefügt!',
    promoVoidGift: 'Spezielles Geschenk eingelöst!',
    promoSpin2Win: 'Spin-Bonus freigeschaltet!',

    confirmResetData: '⚠️ ALLE Daten löschen? Dies kann nicht rückgängig gemacht werden.',
    confirmResetType: 'Gib zur Bestätigung "RESET" ein:',
    resetCancelled: 'Zurücksetzen abgebrochen.',
    allDataReset: 'Alle Daten zurückgesetzt!\nWird neu geladen…',
    confirmClearCache: 'Cache leeren?\n\nDeine Daten bleiben unberührt.'
  },
  zh: {
    home: '首页',
    leaderboard: '排行榜',
    inventory: '物品',
    deposit: '充值',
    settings: '设置',
    customizeExperience: '自定义您的体验',
    promocode: '兑换码',
    language: '语言',
    appLanguage: '应用语言',
    chooseLanguage: '选择您的首选语言',
    notifications: '通知',
    display: '显示',
    privacy: '隐私',
    dangerZone: '危险区域',
    topPlayers: '排行榜',
    leaderboardEmpty: '暂时还没有人上榜——快来当第一个吧！',
    leaderboardErrorTitle: '出了点小状况……',
    leaderboardErrorText: '暂时无法显示排行榜，请稍后再试！',

    copyright: '© 2025 版权所有',
    liveGifts: '实时礼物',
    liveGiftsEmpty: '你赢得的礼物会显示在这里。',
    more: '更多',

    dailyRewardEyebrow: '每日奖励',
    bagOfLoot: '战利品',
    lootHighlight: '袋！',
    dailyRewardSub: '您的免费每日礼物 — 请在午夜前领取。',
    openGift: '打开礼物',
    dailyReadyIn: '还需',
    dailyOnCooldown: '每日礼物冷却中 — 还剩 {time}',

    yourItemsEyebrow: '您的物品',
    inventoryHighlight: '库存',
    inventorySub: '已收集的奖品和礼物。',
    viewAllItems: '查看全部物品',

    premiumSpinEyebrow: '高级转盘',
    voidSpinTitle: 'VOID',
    voidSpinTitleSuffix: 'Spin',
    voidSpinSub: '更高赌注 — NFT、星星和稀有礼物等你来拿。',
    furrySpinTitle: 'FURRY',
    furrySpinSub: 'Instant Ramen、Star Notepad、Calendar 等 NFT、星星奖励和稀有礼物。毛茸茸的好运。',
    hexSpinTitle: 'STARRY',
    hexSpinSub: 'Kissed Frog、Voodoo Doll、Vintage Cigar 等 NFT 和高额星星奖励。星空下的好运。',
    astralSpinTitle: 'ASTRAL',
    astralSpinSub: 'Astral Shard、Lucky Locket、Voodoo Doll 和 Input Key，最高额的星星奖励。摘星而去。',
    newSpinEyebrow: '新转盘',
    eventBadgeAnniversary: '🎉 周年纪念',
    eventBirthdayTitleSm: '应用',
    eventBirthdayTitleLg: '生日快乐！',
    eventBirthdaySub: '感谢这美好的一年',
    eventBadgeLimited: '限时',
    eventStarsTitle: '双倍星星周末',
    eventStarsSub: '每次充值赠送奖励星星',
    starsWord: '星星',
    spinNow: '立即旋转',

    freeDropsEyebrow: '每日免费掉落',
    freeHighlight: '免费',
    channelSuffix: '频道',
    channelSub: '加入以不错过任何抽奖或秘密代码。',
    joinChannel: '加入频道',

    exclusiveRewardsEyebrow: '专属奖励',
    enterCodesFor: '兑换码赢',
    prizesHighlight: '奖品！',
    findCodes: '在我们的',
    telegramWord: 'telegram',
    channelWord: '频道中查找兑换码。',
    enterCode: '输入兑换码',

    contactSupport: '联系客服',
    settingsAndCodes: '设置与兑换码',

    updatesEvery24h: '每24小时更新一次',
    tabCoins: '金币',
    tabGifts: '礼物',
    tabStars: '星星',
    yourRank: '您的排名',

    depositEyebrow: 'telegram stars',
    depositTitle: '充值',
    depositSubtitle: '使用 Telegram Stars 购买金币',
    tabTelegramStars: 'Telegram Stars',
    tabTonCoin: 'TON Coin',
    tabSell: '出售礼物',
    sellTitle: '出售 NFT 礼物换取星星',
    sellHowTo: '在 Telegram 中将收藏品发送给 @{relayer}，下方列出的星星会自动充值到你的余额。',
    sellOpenRelayer: '打开 @{relayer}',
    sellSearch: '搜索礼物…',
    sellNoResults: '未找到礼物',
    sellCount: '件礼物已定价',
    sellWord: '出售',
    securePayment: '安全支付',
    securePaymentDesc: '所有交易均通过 Telegram 安全处理。金币即时到账。',
    purchase: '购买',
    popular: '热门',

    promocodePlaceholder: '输入兑换码...',
    promocodeInfo: '输入有效的兑换码以获取奖励',

    soundEffects: '音效',
    soundEffectsDesc: '旋转时播放声音',
    prizeAlerts: '奖品提醒',
    prizeAlertsDesc: '稀有奖品提醒',
    animations: '动画',
    animationsDesc: '流畅的动画与特效',
    showInLeaderboard: '在排行榜中显示',
    showInLeaderboardDesc: '公开统计信息可见性',
    shareStatistics: '分享统计信息',
    shareStatisticsDesc: '允许与好友分享统计信息',

    about: '关于',
    termsOfService: '服务条款',
    termsOfServiceDesc: '阅读我们的条款和条件',
    privacyPolicy: '隐私政策',
    privacyPolicyDesc: '我们如何处理您的数据',
    version: '版本',
    versionDesc: '应用版本信息',

    resetAllData: '重置所有数据',
    clearCache: '清除缓存',

    backToHome: '首页',
    whatCanIGet: '我能获得',
    getWord: '什么？',
    spinButton: '旋转！',
    coinPrizes: '金币奖品',
    starPrizes: '星星奖品',

    youWon: '您赢得了',
    claim: '领取！',

    yourPrize: '您的奖品',
    convertToCoins: '兑换为金币',
    claimPrize: '领取奖品',
    coinsWord: '金币',
    coinsValue: '金币价值',
    starsAddedToBalance: '星星已添加到余额',

    selectLanguage: '选择语言',

    yourCompleteInventory: '您的完整库存',
    totalGifts: '礼物总数',
    totalValue: '总价值',
    rareGifts: '稀有礼物',
    filterAll: '全部礼物',
    filterTelegram: 'Telegram 礼物',
    filterNft: 'NFT',
    filterRare: '仅稀有',
    noGiftsYet: '暂无礼物',
    noGiftsYetDesc: '转动转盘赢取您的第一个礼物！',

    settingSaved: '设置已保存',
    languageChanged: '语言已更改',
    paymentSuccessAdding: '支付成功！正在添加 {n} 星星…',
    starsAdded: '已添加 {n} 星星！',
    notEnoughStars: '星星不足 — 需要 {n} ⭐',
    tabSpent: '已花费',
    multiResultsTitle: '×{n} 次结果',
    multiChanceNft: '至少获得一个 NFT 的概率：{p}%',
    multiChanceGift: '至少获得一个礼物的概率：{p}%',
    multiCollect: '领取',
    multiTotalStars: '赢得星星总数',
    multiSpinsWord: '次数',
    spentWord: '已花费星星',
    creatingInvoice: '正在创建发票…',
    paymentCancelled: '支付已取消',
    paymentFailed: '支付失败，请重试。',
    claimingGift: '正在领取您的礼物…',
    giftSentToTelegram: '{name} 已发送到您的 Telegram！',
    failedToClaim: '领取失败：{msg}',
    noPrizeSelected: '未选择奖品',
    telegramUnavailable: 'Telegram 不可用',
    giftMappingError: '礼物映射错误：{name}',
    cacheCleared: '缓存已清除',
    telegramWebAppUnavailable: 'Telegram WebApp 不可用',
    userIdUnavailable: '用户ID不可用',
    subscribeEyebrow: '需要操作',
    subscribeTitle: '需要订阅',
    subscribeDesc: '加入我们的 Telegram 频道以解锁转盘。',
    subscribeCheckBtn: '确定',
    subscribeChecking: '检查中...',
    notSubscribedYet: '你还没有加入。加入频道后点击确定。',
    subscribeCheckFailed: '暂时无法验证，请重试。',
    invoiceError: '错误：{msg}',
    giftSentPopupTitle: '礼物已发送！',
    giftSentPopupMessage: '您的 {name} 礼物已发送到您的 Telegram 账户！',
    claimFailedPopupTitle: '领取失败',
    topupRequiredTitle: '需要充值',
    topupRequiredPopup: '领取 NFT 礼物每次都需要至少充值 {n} Stars。请充值后返回再次领取。',
    topupBtn: '充值 Stars',
    peerNotFoundPopup: '礼物账号还不认识你。请打开 {relayer}，点击 Start，然后返回再次领取。',
    openRelayerBtn: '打开 {relayer}',

    promoEnterCode: '请输入兑换码',
    promoAlreadyRedeemed: '兑换码已使用',
    promoInvalid: '无效的兑换码',
    promoExpired: '该优惠码已过期',
    promoUsedUp: '该优惠码已用完',
    promoRedeemedShort: '优惠码已兑换！',
    serverUnreachable: '无法连接游戏服务器，请重试',
    promoPaymentRequired: '在应用内支付 {n} TON 后即可使用优惠码',
    promoBlocked: '此账号无法使用优惠码',
    promoRedeemed: '✓ {message} +{coins} 金币！',
    promoWelcome: '欢迎奖励已领取！',
    promoLucky: '幸运奖励已激活！',
    promoFree: '已添加免费金币！',
    promoVoidGift: '特殊礼物已兑换！',
    promoSpin2Win: '旋转奖励已解锁！',

    confirmResetData: '⚠️ 删除所有数据？此操作无法撤销。',
    confirmResetType: '输入 "RESET" 以确认：',
    resetCancelled: '重置已取消。',
    allDataReset: '所有数据已重置！\n正在重新加载…',
    confirmClearCache: '清除缓存？\n\n您的数据不会受到影响。'
  }
};

const LANGUAGE_NAMES = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
  generatePrizeId() {
    const four  = Math.floor(1000 + Math.random() * 9000);
    const two   = Math.floor(10 + Math.random() * 90);
    const three = Array.from({ length: 3 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    return `${four}-${two}-${three}`;
  },

  // t(key, vars) — vars is an optional { token: value } map used to fill
  // {token} placeholders in the translated string (e.g. t('starsAdded', { n: 50 })).
  t(key, vars) {
    const lang = STATE.settings.language;
    let str = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
    if (vars) {
      Object.keys(vars).forEach(k => { str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]); });
    }
    return str;
  },

  createErrorIcon() {
    const ns  = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.style.color = '#ef4444';
    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', '12'); circle.setAttribute('cy', '12'); circle.setAttribute('r', '10');
    const l1 = document.createElementNS(ns, 'line');
    l1.setAttribute('x1','15'); l1.setAttribute('y1','9'); l1.setAttribute('x2','9'); l1.setAttribute('y2','15');
    const l2 = document.createElementNS(ns, 'line');
    l2.setAttribute('x1','9'); l2.setAttribute('y1','9'); l2.setAttribute('x2','15'); l2.setAttribute('y2','15');
    svg.append(circle, l1, l2);
    return svg;
  },

  setVH() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  },

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position:fixed;bottom:calc(6rem + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);
      background:${type === 'success' ? 'rgba(16,185,129,0.92)' : 'rgba(239,68,68,0.92)'};
      color:#fff;padding:.75rem 1.4rem;border-radius:16px;font-weight:600;
      font-size:.88rem;z-index:10000;opacity:0;transition:opacity .3s ease;
      font-family:'Onest',sans-serif;white-space:nowrap;max-width:calc(100vw - 2rem);overflow:hidden;text-overflow:ellipsis;
    `;
    document.body.appendChild(toast);
    void toast.offsetHeight;
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 2200);
  }
};

// ============================================
// STATUS CHECK — remote app status (production /
// maintenance). Fail-open: if the check itself
// fails for any reason (network down, bad JSON,
// slow response), we treat it as production so a
// broken status endpoint never blocks a working app.
// ============================================

// Standalone TON on-chain payment backend (ton-payments.js). Fully
// independent of vgtserver (gift transactor) and vgservers (Stars invoices).
const TON_API_BASE = 'https://ton-backend347-production.up.railway.app';
const INVOICE_API_BASE = 'https://vgservers-dev-85d2.up.railway.app'; // main bot: /create-invoice, /stars/claim-credits, /check-subscription

// VGDataStorage — Postgres-backed service that also holds the shared
// users table (profile + coins/stars) the global leaderboard reads from.
const DATA_STORE_URL = 'https://vgdatastorage-dev-98a3.up.railway.app';
// The authoritative game server (VGGameServer). Set this to your Railway URL.
const GAME_API_BASE = 'https://vggameserver-dev-fb67.up.railway.app';

// Gift Relayer (V2) — replaces the deprecated vgtserver /claim-gift.
// Verifies Telegram initData itself and sends/transfers gifts from the
// @VoidGift_Relayer user account. Point this at wherever gift-relayer.js
// is deployed.
const GIFT_RELAYER_URL = 'https://voidgiftsrelayer-arr-dev-a64a.up.railway.app';

const STATUS_CONFIG = {
  URL: 'https://raw.githubusercontent.com/sn0wydev/VGDevBranch/main/status.json',
  TIMEOUT_MS: 4000
};

const StatusCheck = {
  async fetchStatus() {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), STATUS_CONFIG.TIMEOUT_MS);
      const res = await fetch(`${STATUS_CONFIG.URL}?t=${Date.now()}`, {
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timer);
      if (!res.ok) return { status: 'production' };
      const data = await res.json();
      const allowed = ['production', 'maintenance'];
      if (!allowed.includes(data.status)) return { status: 'production' };
      return data;
    } catch {
      return { status: 'production' };
    }
  }
};

// ============================================
// BACKEND / CLOUD STORAGE
// ============================================

// ============================================
// GAME API — the browser only ASKS; the game server decides.
// Spins, daily gift, promocodes, balances and prize creation all happen on
// the server (VGGameServer). Nothing here can change what a player owns:
// every request carries Telegram's signed initData and the server takes the
// user id from that signature.
// ============================================
const GameAPI = {
  cfg: null,
  pending: null,          // last spin's final balance + results, applied when the reel stops
  _firstRefresh: null,

  async req(method, path, body) {
    const res = await fetch(GAME_API_BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': STATE.tg?.initData || '' },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const e = new Error(data.error || `HTTP ${res.status}`);
      e.code = data.code; e.status = res.status; e.data = data;
      throw e;
    }
    return data;
  },

  // Prices, display-only reel rows, coin values: filled into the (empty) tables above.
  async loadConfig() {
    const res = await fetch(GAME_API_BASE + '/api/config', { cache: 'no-store' });
    if (!res.ok) throw new Error(`config HTTP ${res.status}`);
    const cfg = await res.json();
    this.cfg = cfg;
    Object.assign(PRIZE_COIN_VALUES, cfg.coinValues);
    const T = { daily: [SPIN_PRIZES, PREVIEW_PRIZES], void: [VOID_SPIN_PRIZES, VOID_PREVIEW_PRIZES], furry: [FURRY_SPIN_PRIZES, FURRY_PREVIEW_PRIZES],
                hex: [HEX_SPIN_PRIZES, HEX_PREVIEW_PRIZES], astral: [ASTRAL_SPIN_PRIZES, ASTRAL_PREVIEW_PRIZES] };
    for (const [name, w] of Object.entries(cfg.wheels)) {
      if (!T[name]) continue;
      const rows = w.preview.map(r => r.type === 'gift' ? { ...r, lottie: `assets/gift${String(r.value).replace(/[^A-Za-z0-9]/g, '')}.json` } : { ...r, icon: r.type === 'coin' ? 'coin' : 'stars' });
      T[name][0].splice(0, T[name][0].length, ...rows);   // lookup + reel filler
      T[name][1].splice(0, T[name][1].length, ...rows);   // idle reel
      if (name !== 'daily') CONFIG[`${name.toUpperCase()}_SPIN_COST`] = w.price;
    }
    if (cfg.dailyCooldownMs) CONFIG.DAILY_COOLDOWN_MS = cfg.dailyCooldownMs;
  },

  tableFor(w) {
    return { daily: SPIN_PRIZES, void: VOID_SPIN_PRIZES, furry: FURRY_SPIN_PRIZES, hex: HEX_SPIN_PRIZES, astral: ASTRAL_SPIN_PRIZES }[w] || [];
  },

  // Server result row -> the prize object the wheel/modal code already understands.
  toPrize(w, r) {
    const row = this.tableFor(w).find(p => p.id === r.id);
    return { ...(row || { id: r.id, type: r.type, value: r.value }), type: r.type, value: r.value, prizeId: r.prize_id };
  },

  applyBalance(b, animate = true) {
    if (!b) return;
    const oldCoins = STATE.userCoins;
    STATE.userStars = Number(b.stars);
    STATE.starsSpentTotal = Number(b.stars_spent ?? STATE.starsSpentTotal ?? 0);
    if (animate && Number(b.coins) !== oldCoins) Currency.animateChange(oldCoins, Number(b.coins));
    else { STATE.userCoins = Number(b.coins); }
    Currency.update();
  },

  setInventory(list) {
    STATE.inventoryItems = (list || [])
      .filter(r => r.status !== 'claimed' && r.status !== 'converted')
      .map(r => ({
        value: r.gift_name, type: 'gift', lottie: true, prizeId: r.prize_id,
        claimedAt: new Date(r.created_at).getTime(),
        pendingTransfer: r.status === 'queued_nft',
        availableAt: r.scheduled_for ? new Date(r.scheduled_for).getTime() : undefined
      }));
  },

  // Pulls balances, inventory and the daily-gift timer. Also makes the server
  // collect any Stars/TON purchase that has been confirmed.
  async refresh() {
    if (!STATE.tg?.initData) return null;
    try {
      const d = await this.req('GET', '/api/me');
      this.applyBalance(d.balance, false);
      if (d.credited > 0) Utils.showToast(Utils.t('starsAdded', { n: d.credited }), 'success');
      this.setInventory(d.inventory);
      if (!STATE.isSpinning) STATE.dailyReadyAt = Date.now() + (d.daily?.remaining_ms || 0);
      if (typeof Inventory !== 'undefined' && Inventory.updateDisplay) Inventory.updateDisplay();
      STATE.lastBalanceSync = Date.now();
      return d;
    } catch (err) {
      console.error('❌ refresh failed:', err);
      return null;
    }
  },

  async claimCredits() {
    if (!STATE.tg?.initData) return 0;
    try {
      const d = await this.req('POST', '/api/credits/claim');
      this.applyBalance(d.balance, false);
      return d.credited || 0;
    } catch { return 0; }
  },

  async spin(wheel, mult) { return this.req('POST', '/api/spin', { wheel, mult }); },
  async daily()           { return this.req('POST', '/api/daily'); },
  async promo(code)       { return this.req('POST', '/api/promo', { code }); },
  async convert(prizeId)  { return this.req('POST', `/api/prizes/${encodeURIComponent(prizeId)}/convert`); },

  // Shared error UI for spin/daily requests.
  handleError(e, { btn, need } = {}) {
    if (e.code === 'INSUFFICIENT_STARS') {
      Utils.showToast(Utils.t('notEnoughStars', { n: need ?? e.data?.need ?? '' }), 'error');
      if (btn) { btn.classList.remove('shake-error'); void btn.offsetWidth; btn.classList.add('shake-error'); setTimeout(() => btn.classList.remove('shake-error'), 400); }
      this.refresh();
    } else if (e.code === 'SUBSCRIPTION_REQUIRED') {
      Utils.showToast(e.message, 'error');
    } else if (e.code === 'DAILY_COOLDOWN') {
      STATE.dailyReadyAt = Date.now() + (e.data?.remaining_ms || 0);
      SpinWheel.updateCooldownUI?.();
      SpinWheel.notifyIfCooldown?.();
    } else {
      Utils.showToast(e.message || 'Connection problem', 'error');
    }
  },

  // Called the moment the reel stops: shows the server's final balance and puts won gifts in the inventory.
  settle(list) {
    const p = this.pending;
    if (!p) return;
    this.pending = null;
    this.applyBalance(p.balance);
    const rare = [];
    for (const prize of list) {
      if (prize.type !== 'gift' || !prize.prizeId) continue;
      const item = Inventory.add(prize);
      if (RARE_GIFTS.includes(item.value)) rare.push(item);
    }
    rare.forEach(i => LiveGiftNotifications.add(i));
  }
};

const BackendAPI = {
  isCloudStorageAvailable() { return !!(STATE.tg?.CloudStorage?.getItem); },
  async _cloudGet(key, fallback) {
    if (this.isCloudStorageAvailable()) {
      return new Promise((resolve) => {
        STATE.tg.CloudStorage.getItem(key, (err, val) => {
          if (err) { const fb = localStorage.getItem(key); resolve(fb ? parseInt(fb, 10) : fallback); }
          else      { resolve(val ? parseInt(val, 10) : fallback); }
        });
      });
    }
    const saved = localStorage.getItem(key);
    return saved ? parseInt(saved, 10) : fallback;
  },

  // Balances, inventory and the daily timer come from the game server only.
  async syncBalance() { await GameAPI.refresh(); Currency.update(); },

  // Only the leaderboard-visibility switch is a player setting; everything else
  // about a profile the server reads from Telegram's signed data.
  syncUserProfile(partial = {}) {
    if (typeof partial.show_in_leaderboard === 'boolean') {
      GameAPI.req('POST', '/api/profile', { show_in_leaderboard: partial.show_in_leaderboard }).catch(() => {});
    }
  },

  // Purchases (Stars / TON) are collected by the server.
  async claimTonCredits()  { return GameAPI.claimCredits(); },
  async claimStarCredits() { return GameAPI.claimCredits(); },

  // The payment update reaches the bot a moment after the popup reports "paid",
  // so keep asking for a short while before giving up.
  async waitForStarCredits(expected) {
    for (let i = 0; i < 12; i++) {
      await new Promise(r => setTimeout(r, i === 0 ? 800 : 1500));
      const got = await GameAPI.claimCredits();
      if (got > 0) { Utils.showToast(Utils.t('starsAdded', { n: got }), 'success'); return got; }
    }
    return 0;
  },

  startPeriodicSync() {
    this.syncBalance();
    if (STATE.syncIntervalId) clearInterval(STATE.syncIntervalId);
    STATE.syncIntervalId = setInterval(() => this.syncBalance(), CONFIG.BALANCE_SYNC_INTERVAL);
  },

  stopPeriodicSync() {
    if (STATE.syncIntervalId) { clearInterval(STATE.syncIntervalId); STATE.syncIntervalId = null; }
  }
};

// ============================================
// TELEGRAM WEB APP
// ============================================

const TelegramApp = {
  init() {
    if (STATE.tg) {
      if (STATE.tg.initDataUnsafe?.user) {
        STATE.userData = STATE.tg.initDataUnsafe.user;
        this.updateUserProfile(STATE.userData);
      }
      this.applyTheme();
      STATE.tg.ready();
      STATE.tg.expand();
      BackendAPI.startPeriodicSync();
      BackendAPI.syncUserProfile();

      STATE.tg.onEvent('viewportChanged', (e) => {
        if (e.isStateStable) setTimeout(() => BackendAPI.syncBalance(), 1000);
      });

      // Keep the bottom nav's safe-area padding in sync with Telegram's
      // own inset reporting (covers half-expanded / fullscreen states
      // and devices where env(safe-area-inset-bottom) alone isn't enough).
      this._applySafeArea();
      STATE.tg.onEvent('viewportChanged', () => this._applySafeArea());
      STATE.tg.onEvent('safeAreaChanged', () => this._applySafeArea());
    } else {
      this.initFallbackMode();
    }
  },

  _applySafeArea() {
    const bottom = STATE.tg?.safeAreaInset?.bottom ?? 0;
    document.documentElement.style.setProperty('--tg-safe-bottom', `${bottom}px`);
  },

  initFallbackMode() {
    this.updateUserProfile({ first_name: 'Test User', username: 'testuser', photo_url: null });
  },

  updateUserProfile(user) {
    const nameEl   = document.querySelector('.account-name');
    const userEl   = document.querySelector('.account-username');
    const avatarEl = document.querySelector('.account-avatar');

    if (nameEl) {
      nameEl.textContent = user.last_name
        ? `${user.first_name} ${user.last_name}`
        : (user.first_name || 'User');
    }
    if (userEl) {
      userEl.textContent = user.username ? `@${user.username}` : 'No username';
    }
    if (avatarEl) {
      if (user.photo_url) {
        avatarEl.style.cssText = `background-image:url(${user.photo_url});background-size:cover;background-position:center`;
      } else {
        const initials = (user.first_name?.[0] ?? 'U') + (user.last_name?.[0] ?? '');
        avatarEl.textContent = initials;
        Object.assign(avatarEl.style, { display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:'bold', color:'#60a5fa' });
      }
    }
  },

  applyTheme() {
    if (STATE.tg?.themeParams) {
      document.documentElement.style.setProperty('--tg-theme-bg-color',   STATE.tg.themeParams.bg_color   || '#0f172a');
      document.documentElement.style.setProperty('--tg-theme-text-color', STATE.tg.themeParams.text_color || '#ffffff');
    }
  },

  sendData(data) {
    if (STATE.tg?.sendData) {
      try { STATE.tg.sendData(JSON.stringify(data)); return true; }
      catch { return false; }
    }
    return false;
  }
};

// ============================================
// LOADING SCREEN
// ============================================

const LoadingScreen = {
  loadingAnimation: null,

  init() {
    document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
    Utils.setVH();
    window.addEventListener('resize', Utils.setVH);
    window.addEventListener('orientationchange', Utils.setVH);

    if (typeof lottie !== 'undefined') {
      this.initAnimation('assets/dev_duck--@DMJ_Stickers.json');
      this.startLoading();
    } else {
      setTimeout(() => this.init(), 100);
    }
  },

  initAnimation(path) {
    const el = document.getElementById('lottie-loading-container');
    if (!el) return;
    if (this.loadingAnimation) { this.loadingAnimation.destroy(); this.loadingAnimation = null; }
    el.innerHTML = '';
    this.loadingAnimation = lottie.loadAnimation({
      container: el, renderer: 'svg', loop: true, autoplay: true, path
    });
  },

  startLoading() {
    const startTime = Date.now();
    const checkComplete = () => {
      const remaining = Math.max(0, CONFIG.LOADING_MIN_TIME - (Date.now() - startTime));
      setTimeout(() => this.hide(), remaining);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkComplete);
    } else {
      checkComplete();
    }
  },

  hide() {
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContent   = document.getElementById('mainContent');
    if (!loadingScreen || !mainContent) return;
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      mainContent.style.display  = 'block';
      setTimeout(() => {
        mainContent.classList.add('visible');
        document.body.classList.remove('no-scroll');
      }, 50);
    }, 500);
  },

  // ── Maintenance mode ──
  // Swaps the duck, hides the progress bar, rewrites the text — and
  // deliberately never calls hide(). The rest of the app (Navigation,
  // wheels, Telegram sync) is also never started for this status in
  // initializeApp(), so there's nothing half-working underneath to
  // accidentally reveal.
  showMaintenance(message) {
    document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
    Utils.setVH();
    window.addEventListener('resize', Utils.setVH);
    window.addEventListener('orientationchange', Utils.setVH);

    const start = () => {
      this.initAnimation('assets/DuckyThink.json');

      const heading = document.getElementById('loadingStatusHeading');
      if (heading) { heading.textContent = 'Тех Перерыв'; heading.style.display = 'block'; }

      const barWrap = document.getElementById('loadingBarWrapper');
      if (barWrap) barWrap.style.display = 'none';

      const textEl = document.getElementById('loadingText');
      if (textEl) {
        textEl.innerHTML = message
          ? message
          : 'Исправляем и делаем лучше! Подробнее на: <a href="https://t.me/VoidGiftsOfficial" target="_blank" rel="noopener noreferrer">t.me/VoidGiftsOfficial</a>';
      }
    };

    if (typeof lottie !== 'undefined') start();
    else setTimeout(() => this.showMaintenance(message), 100);
  }
};

// ============================================
// CURRENCY
// ============================================

// Balances are owned by the game server. This object only DRAWS them (see GameAPI.applyBalance).
const Currency = {
  animateChange(oldValue, newValue, duration = 1000) {
    const el = document.getElementById('currencyAmount');
    if (!el) return;
    const start = performance.now();
    const diff  = newValue - oldValue;
    const tick  = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(oldValue + diff * eased).toLocaleString();
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        STATE.userCoins = newValue;
        el.textContent  = newValue.toLocaleString();
        Leaderboard.updateData();
      }
    };
    requestAnimationFrame(tick);
  },

  update() {
    const coinsEl = document.getElementById('currencyAmount');
    if (coinsEl) coinsEl.textContent = STATE.userCoins.toLocaleString();
    const starsEl = document.getElementById('starsAmount');
    if (starsEl) starsEl.textContent = STATE.userStars.toLocaleString();
  }
};

// ============================================
// COUNTDOWN — live badge for NFT gifts queued for transfer
// ============================================
// One shared 1s ticker updates every countdown-badge element's text.
// A slower poll (per watched prize) asks the relayer whether the
// transfer actually completed, and flips the item over to "claimed"
// (removed from inventory) once it has.
// ============================================

const Countdown = {
  _watched: new Map(), // prizeId -> pollTimer

  format(availableAtMs) {
    const remainingMs = availableAtMs - Date.now();
    if (remainingMs <= 0) return Utils.t('nftTransferProcessing');
    const totalSec = Math.floor(remainingMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  init() {
    // Resume watching anything already marked pending (e.g. after a
    // re-render triggered by other app state, not a fresh claim).
    STATE.inventoryItems.filter(i => i.pendingTransfer).forEach(i => this.watch(i.prizeId));

    setInterval(() => {
      document.querySelectorAll('.countdown-badge').forEach(el => {
        const item = STATE.inventoryItems.find(i => i.prizeId === el.dataset.prizeId);
        if (item) el.textContent = this.format(item.availableAt);
      });
    }, 1000);
  },

  watch(prizeId) {
    if (this._watched.has(prizeId)) return;
    const poll = async () => {
      try {
        const res = await fetch(`${GIFT_RELAYER_URL}/claim-status/${prizeId}`);
        const data = await res.json();
        if (data.status === 'claimed') {
          clearInterval(this._watched.get(prizeId));
          this._watched.delete(prizeId);
          Inventory.remove(prizeId);
          Utils.showToast(Utils.t('nftTransferComplete', { name: data.gift_name }), 'success');
        } else if (data.status === 'failed') {
          clearInterval(this._watched.get(prizeId));
          this._watched.delete(prizeId);
          Utils.showToast(Utils.t('nftTransferFailed', { name: data.gift_name }), 'error');
        }
      } catch { /* transient network error, try again next tick */ }
    };
    poll();
    this._watched.set(prizeId, setInterval(poll, 60000)); // check completion once a minute
  }
};

// ============================================
// INVENTORY
// ============================================

const Inventory = {
  async loadFromServer() { await GameAPI.refresh(); },
  
  add(prize) {
    const item = { ...prize, prizeId: prize.prizeId || Utils.generatePrizeId(), claimedAt: Date.now() };
    STATE.inventoryItems.push(item);
    this.updateDisplay();
    const modal = document.getElementById('fullInventoryModal');
    if (modal?.classList.contains('show')) {
      FullInventoryModal.updateStats();
      FullInventoryModal.render(STATE.currentFilter);
    }
    return item;
  },

  remove(prizeId) {
    const idx = STATE.inventoryItems.findIndex(i => i.prizeId === prizeId);
    if (idx === -1) return null;
    const removed = STATE.inventoryItems.splice(idx, 1)[0];
    this.updateDisplay();
    const modal = document.getElementById('fullInventoryModal');
    if (modal?.classList.contains('show')) {
      FullInventoryModal.updateStats();
      FullInventoryModal.render(STATE.currentFilter);
    }
    return removed;
  },

  // Marks an NFT-tier item as claimed-but-not-yet-transferred. It stays
  // visible in the inventory (still counts, still shown) but renders
  // with a countdown badge until availableAt passes. The relayer's
  // background worker is what actually completes the transfer — this
  // is purely a UI state until Countdown.poll() confirms it's done.
  markPendingTransfer(prizeId, scheduledForIso) {
    const item = STATE.inventoryItems.find(i => i.prizeId === prizeId);
    if (!item) return;
    item.pendingTransfer = true;
    item.availableAt = new Date(scheduledForIso).getTime();
    this.updateDisplay();
    const modal = document.getElementById('fullInventoryModal');
    if (modal?.classList.contains('show')) FullInventoryModal.render(STATE.currentFilter);
    Countdown.watch(prizeId);
  },

  updateDisplay() {
    const grid = document.querySelector('.inventory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const display = STATE.inventoryItems.slice(0, CONFIG.MAX_INVENTORY_DISPLAY);
    display.forEach(item => {
      const div  = document.createElement('div');
      div.className      = 'inventory-item' + (item.pendingTransfer ? ' pending-transfer' : '');
      div.dataset.prizeId = item.prizeId;
      const iconDiv = document.createElement('div');
      iconDiv.className  = 'item-icon-container';
      if (item.lottie) {
        const img = Object.assign(document.createElement('img'), {
          src: GIFT_SVG_ICONS[item.value] ?? '',
          alt: item.value
        });
        img.style.cssText = 'width:100%;height:100%;object-fit:contain';
        iconDiv.appendChild(img);
      }
      div.appendChild(iconDiv);
      if (item.pendingTransfer) {
        const badge = Object.assign(document.createElement('div'), {
          className: 'countdown-badge'
        });
        badge.dataset.prizeId = item.prizeId;
        badge.textContent = Countdown.format(item.availableAt);
        div.appendChild(badge);
      }
      div.addEventListener('click', () => PrizeModal.open(item));
      grid.appendChild(div);
    });

    const empties = CONFIG.MAX_INVENTORY_DISPLAY - display.length;
    for (let i = 0; i < empties; i++) {
      const e = document.createElement('div');
      e.className = 'inventory-item empty';
      grid.appendChild(e);
    }
    Leaderboard.updateData();
  },

  getItems()      { return STATE.inventoryItems.map(i => ({ prizeId: i.prizeId, prizeName: i.value, prizeType: i.type, claimedAt: i.claimedAt })); },
  verify(prizeId) { return STATE.inventoryItems.some(i => i.prizeId === prizeId); }
};

// ============================================
// PRIZE MODAL
// ============================================

const PrizeModal = {
  open(prize) {
    STATE.currentModalPrize = prize;

    const modal    = document.getElementById('prizeModal');
    const iconEl   = document.getElementById('prizeModalIcon');
    const nameEl   = document.getElementById('prizeModalName');
    const idEl     = document.getElementById('prizeModalId');
    const valueEl  = document.getElementById('prizeModalCoinValue');
    if (!modal || !iconEl || !nameEl || !idEl || !valueEl) return;

    iconEl.innerHTML = '';

    if (prize.lottie) {
      const img = document.createElement('img');
      img.src = GIFT_SVG_ICONS[prize.value] ?? '';
      img.alt = prize.value;
      img.style.cssText = 'width:100%;height:100%;object-fit:contain';
      iconEl.appendChild(img);
    } else if (prize.type === 'coin') {
      const img = document.createElement('img');
      img.src = 'assets/Coin.svg'; img.alt = 'Coins';
      img.style.cssText = 'width:100%;height:100%;object-fit:contain';
      iconEl.appendChild(img);
    }

    nameEl.textContent = prize.value;
    idEl.textContent   = `ID: ${prize.prizeId}`;

    const coinsVal = PRIZE_COIN_VALUES[prize.value] ?? 50;
    valueEl.innerHTML = `
      <img src="assets/Coin.svg" alt="Coins">
      <span>${coinsVal.toLocaleString()} ${Utils.t('coinsWord')}</span>
    `;

    modal.classList.add('show');
  },

  close() {
    const modal = document.getElementById('prizeModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => {
      const iconEl = document.getElementById('prizeModalIcon');
      if (iconEl) iconEl.innerHTML = '';
      STATE.currentModalPrize = null;
    }, 300);
  },

  async convert() {
    if (!STATE.currentModalPrize || STATE.isConverting) return;
    const prize = STATE.currentModalPrize;
    STATE.isConverting = true;
    try {
      const r = await GameAPI.convert(prize.prizeId);
      STATE.currentModalPrize = null;
      Inventory.remove(prize.prizeId);
      GameAPI.applyBalance(r.balance);
      this.close();
    } catch (e) {
      Utils.showToast(e.code === 'NOT_CONVERTIBLE' ? e.message : (e.message || 'Connection problem'), 'error');
      GameAPI.refresh();
    } finally { STATE.isConverting = false; }
  },

  async claim() {
    if (!STATE.currentModalPrize) { Utils.showToast(Utils.t('noPrizeSelected'), 'error'); return; }
    if (STATE.isClaimingPrize) return; // already mid-claim — ignore extra clicks

    const prize    = STATE.currentModalPrize;
    const prizeId  = prize.prizeId;
    const giftName = prize.value;

    // initData is the raw, Telegram-signed session string — the relayer
    // verifies this server-side instead of trusting a client-supplied
    // user id, so this must be present and non-empty.
    const initData = STATE.tg?.initData;
    if (!initData) { Utils.showToast(Utils.t('telegramUnavailable'), 'error'); return; }

    const claimBtn = document.getElementById('claimPrizeBtn');

    STATE.isClaimingPrize = true;
    Utils.showToast(Utils.t('claimingGift'), 'success');
    if (claimBtn) { claimBtn.disabled = true; claimBtn.textContent = Utils.t('claimingGift'); }

    try {
      const res = await fetch(`${GIFT_RELAYER_URL}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, prizeId, giftName })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.error || 'Failed to claim gift');
        err.code = data.code;                       // e.g. 'PEER_NOT_FOUND', 'TOPUP_REQUIRED'
        err.relayerUsername = data.relayer_username;
        err.requiredStars = data.required_stars;
        throw err;
      }

      this.close();

      if (data.claim_type === 'nft') {
        // Not sent yet — stays in inventory as a pending transfer with
        // a live countdown until the relayer's background worker picks
        // it up. Do NOT remove it here.
        Inventory.markPendingTransfer(prizeId, data.scheduled_for);
        Utils.showToast(Utils.t('nftClaimQueued', { name: giftName }), 'success');
        STATE.tg.showPopup?.({
          title: Utils.t('giftSentPopupTitle'),
          message: Utils.t('nftClaimQueuedPopup', { name: giftName }),
          buttons: [{ type: 'close' }]
        });
      } else {
        Inventory.remove(prizeId);
        Utils.showToast(Utils.t('basicClaimSent', { name: giftName }), 'success');
        STATE.tg.showPopup?.({
          title: Utils.t('giftSentPopupTitle'),
          message: Utils.t('basicClaimSentPopup', { name: giftName }),
          buttons: [{ type: 'close' }]
        });
      }
    } catch (error) {
      Utils.showToast(Utils.t('failedToClaim', { msg: error.message }), 'error');

      if (error.code === 'TOPUP_REQUIRED') {
        // NFT gifts need a fresh Stars top-up each time. Say so clearly and
        // offer a one-tap route to the Deposit page.
        const n = error.requiredStars || 25;
        const goTopUp = () => {
          this.close();
          Navigation.navigateTo('deposit');
        };
        if (STATE.tg?.showPopup) {
          STATE.tg.showPopup({
            title: Utils.t('topupRequiredTitle'),
            message: Utils.t('topupRequiredPopup', { n }),
            buttons: [
              { id: 'topup', type: 'default', text: Utils.t('topupBtn') },
              { type: 'close' }
            ]
          }, (btnId) => { if (btnId === 'topup') goTopUp(); });
        } else if (window.confirm(Utils.t('topupRequiredPopup', { n }))) {
          goTopUp();
        }
      } else if (error.code === 'PEER_NOT_FOUND') {
        // The relayer account hasn't "met" this player yet (no public
        // username / never opened its chat). Give them a one-tap fix.
        const relayer = error.relayerUsername || 'VoidGift_Relayer';
        const openRelayer = () => {
          const link = `https://t.me/${relayer}?start=claim`;
          if (STATE.tg?.openTelegramLink) STATE.tg.openTelegramLink(link);
          else window.open(link, '_blank');
        };
        if (STATE.tg?.showPopup) {
          STATE.tg.showPopup({
            title: Utils.t('claimFailedPopupTitle'),
            message: Utils.t('peerNotFoundPopup', { relayer: `@${relayer}` }),
            buttons: [
              { id: 'open', type: 'default', text: Utils.t('openRelayerBtn', { relayer: `@${relayer}` }) },
              { type: 'close' }
            ]
          }, (btnId) => { if (btnId === 'open') openRelayer(); });
        }
      } else {
        STATE.tg?.showPopup?.({
          title: Utils.t('claimFailedPopupTitle'),
          message: `${error.message}\n\nPrize ID: ${prizeId}`,
          buttons: [{ type: 'close' }]
        });
      }
    } finally {
      STATE.isClaimingPrize = false;
      if (claimBtn) { claimBtn.disabled = false; claimBtn.textContent = Utils.t('claimPrize'); }
    }
  }
};

// ============================================
// NAVIGATION
// ============================================

const Navigation = {
  init() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo(link.dataset.page);
        const nav = document.getElementById('navMenu');
        if (nav?.classList.contains('active')) Menu.toggle();
      });
    });

    window.addEventListener('popstate', () => {
      const hash = window.location.hash.slice(1) || 'home';
      this.navigateTo(hash, false);
    });
  },

  navigateTo(pageName, pushHistory = true) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageName}`)?.classList.add('active');

    // Desktop / website-ratio hamburger nav
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.page === pageName);
    });

    // Mobile bottom nav — keep it in sync with whatever page is active,
    // including pages reached from elsewhere (e.g. tapping the Daily
    // Loot card jumps to "dailyspin", which has no bottom-nav icon of
    // its own, so we fall back to leaving Home highlighted for it).
    const bottomNavTarget = pageName === 'dailyspin' ? 'home' : pageName;
    document.querySelectorAll('.bottom-nav-item[data-page]').forEach(b => {
      b.classList.toggle('active', b.dataset.page === bottomNavTarget);
    });

    STATE.currentPage = pageName;
    if (pushHistory) history.pushState(null, '', `#${pageName}`);

    if (pageName === 'leaderboard') Leaderboard.init();
    if (pageName === 'deposit')     Deposit.init();

  }
};

// ============================================
// BOTTOM NAV (mobile / mini-app)
// ============================================

const BottomNav = {
  init() {
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'inventory') {
          // Items tab opens the full inventory modal directly — the
          // home grid's Inventory card is hidden on mobile, so this
          // is the only entry point there.
          FullInventoryModal.open();
          return;
        }
        if (btn.dataset.page) Navigation.navigateTo(btn.dataset.page);
      });
    });
  }
};

// ============================================
// MENU
// ============================================

const Menu = {
  init() {
    document.getElementById('hamburger')?.addEventListener('click', () => this.toggle());
    document.getElementById('navClose')?.addEventListener('click',  () => this.toggle());
    document.getElementById('overlay')?.addEventListener('click',   () => this.closeAll());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeAll(); });
  },

  toggle() {
    ['hamburger','navMenu','overlay'].forEach(id => document.getElementById(id)?.classList.toggle('active'));
    document.body.style.overflow = document.getElementById('navMenu')?.classList.contains('active') ? 'hidden' : '';
  },

  closeAll() {
    ['hamburger','navMenu','overlay'].forEach(id => document.getElementById(id)?.classList.remove('active'));
    document.body.style.overflow = '';
  }
};

// ============================================
// NOTIFICATIONS
// ============================================

const Notifications = {
  add() {
    if (STATE.notifications.length >= CONFIG.MAX_NOTIFICATIONS) return;
    const id   = Date.now() + Math.random();
    const cube = document.createElement('div');
    cube.className   = 'notification-cube';
    cube.dataset.id  = id;
    cube.appendChild(Utils.createErrorIcon());

    const closeBtn = Object.assign(document.createElement('div'), { className: 'close-btn', innerHTML: '×' });
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.remove(id); });
    cube.appendChild(closeBtn);

    const timeBar = document.createElement('div');
    timeBar.className = 'time-bar';
    const fill = document.createElement('div');
    fill.className = 'time-bar-fill';
    timeBar.appendChild(fill);
    cube.appendChild(timeBar);

    document.getElementById('notificationContainer')?.appendChild(cube);
    STATE.notifications.push(id);
    this.updateCount();
    setTimeout(() => this.remove(id), 20000);
  },

  remove(id) {
    const cube = document.querySelector(`[data-id="${id}"]`);
    if (cube) {
      Object.assign(cube.style, { animation:'none', transform:'translateX(100px)', opacity:'0' });
      setTimeout(() => {
        cube.remove();
        STATE.notifications = STATE.notifications.filter(n => n !== id);
        this.updateCount();
      }, 300);
    }
  },

  clearAll() {
    document.querySelectorAll('#notificationContainer .notification-cube:not(.gift-notification):not(.nft-notification)').forEach(c => {
      Object.assign(c.style, { animation:'none', transform:'translateX(100px)', opacity:'0' });
    });
    setTimeout(() => {
      STATE.notifications.forEach(id => document.querySelector(`[data-id="${id}"]`)?.remove());
      STATE.notifications = [];
      this.updateCount();
    }, 300);
  },

  updateCount() {
    const el = document.getElementById('notificationCount');
    if (el) el.textContent = STATE.notifications.length + STATE.liveGiftNotifications.length;
  }
};

// ============================================
// LIVE GIFT NOTIFICATIONS
// ============================================

const LiveGiftNotifications = {
  add(prize) {
    if (STATE.liveGiftNotifications.length >= CONFIG.MAX_LIVE_NOTIFICATIONS) {
      this.remove(STATE.liveGiftNotifications[0]);
    }
    const id    = Date.now() + Math.random();
    const isNFT = NFT_GIFTS.includes(prize.value);
    const cube  = document.createElement('div');
    cube.className  = `notification-cube ${isNFT ? 'nft-notification' : 'gift-notification'}`;
    cube.dataset.id = id;

    const lottieWrap = Object.assign(document.createElement('div'), { className: 'gift-notification-lottie' });
    if (prize.lottie) {
      const img = Object.assign(document.createElement('img'), {
        src: GIFT_SVG_ICONS[prize.value] ?? '',
        alt: prize.value
      });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain';
      lottieWrap.appendChild(img);
    }
    cube.appendChild(lottieWrap);

    const label = Object.assign(document.createElement('div'), { className: 'gift-notification-label', textContent: isNFT ? 'NFT' : prize.value });
    cube.appendChild(label);

    const fill = document.createElement('div'); fill.className = 'time-bar-fill';
    fill.style.animationDuration = `${CONFIG.NOTIFICATION_DURATION}ms`;
    const bar = document.createElement('div'); bar.className = 'time-bar';
    bar.appendChild(fill); cube.appendChild(bar);

    document.getElementById('notificationContainer')?.appendChild(cube);
    STATE.liveGiftNotifications.push(id);
    Notifications.updateCount();
    setTimeout(() => this.remove(id), CONFIG.NOTIFICATION_DURATION);
  },

  remove(id) {
    const cube = document.querySelector(`[data-id="${id}"]`);
    if (cube) {
      Object.assign(cube.style, { animation:'none', transform:'translateX(100px)', opacity:'0' });
      setTimeout(() => {
        cube.remove();
        STATE.liveGiftNotifications = STATE.liveGiftNotifications.filter(n => n !== id);
        Notifications.updateCount();
      }, 300);
    }
  }
};

// ============================================
// FULL INVENTORY MODAL
// ============================================

const FullInventoryModal = {
  open() {
    const modal = document.getElementById('fullInventoryModal');
    if (!modal) return;
    const iconEl = document.getElementById('fullInventoryLottieIcon');
    if (iconEl && !iconEl.children.length) {
      lottie.loadAnimation({ container: iconEl, renderer: 'svg', loop: true, autoplay: true, path: 'assets/CrystalForInv.json' });
    }
    this.updateStats();
    this.render(STATE.currentFilter);
    modal.classList.add('show');
  },

  close() {
    document.getElementById('fullInventoryModal')?.classList.remove('show');
  },

  updateStats() {
    const total  = STATE.inventoryItems.length;
    const value  = STATE.inventoryItems.reduce((s, i) => s + (PRIZE_COIN_VALUES[i.value] ?? 0), 0);
    const rare   = STATE.inventoryItems.filter(i => RARE_GIFTS.includes(i.value)).length;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('totalGiftsCount', total);
    set('totalGiftValue',  value.toLocaleString());
    set('rareGiftsCount',  rare);
  },

  render(filter) {
    const grid  = document.getElementById('fullInventoryGrid');
    const empty = document.getElementById('emptyInventory');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = STATE.inventoryItems.filter(item => {
      if (filter === 'telegram') return !NFT_GIFTS.includes(item.value);
      if (filter === 'nft')      return NFT_GIFTS.includes(item.value);
      if (filter === 'rare')     return RARE_GIFTS.includes(item.value);
      return true;
    });

    if (!filtered.length) {
      if (empty) { empty.style.display = 'flex'; grid.style.display = 'none'; }
      return;
    }
    if (empty) { empty.style.display = 'none'; grid.style.display = 'grid'; }

    filtered.forEach(item => {
      const div = document.createElement('div');
      div.className = 'full-inventory-item'
        + (NFT_GIFTS.includes(item.value) ? ' nft-item' : '')
        + (item.pendingTransfer ? ' pending-transfer' : '');

      const lottieWrap = document.createElement('div');
      lottieWrap.className = 'full-item-lottie';
      if (item.lottie) {
        const img = Object.assign(document.createElement('img'), {
          src: GIFT_SVG_ICONS[item.value] ?? '',
          alt: item.value
        });
        img.style.cssText = 'width:100%;height:100%;object-fit:contain';
        lottieWrap.appendChild(img);
      }
      div.appendChild(lottieWrap);

      const name = Object.assign(document.createElement('div'), { className: 'full-item-name', textContent: item.value });
      const id   = Object.assign(document.createElement('div'), { className: 'full-item-id', textContent: item.prizeId });
      div.append(name, id);

      if (NFT_GIFTS.includes(item.value)) {
        const badge = Object.assign(document.createElement('div'), { className: 'full-item-badge', textContent: 'NFT' });
        div.appendChild(badge);
      }

      if (item.pendingTransfer) {
        const countdown = Object.assign(document.createElement('div'), {
          className: 'countdown-badge full-item-countdown',
          textContent: Countdown.format(item.availableAt)
        });
        countdown.dataset.prizeId = item.prizeId;
        div.appendChild(countdown);
      }

      div.addEventListener('click', () => { PrizeModal.open(item); this.close(); });
      grid.appendChild(div);
    });
  }
};

// ============================================
// LEADERBOARD
// ============================================

const Leaderboard = {
  _fetchPromise: null,

  init() {
    const trophyEl = document.getElementById('leaderboardTrophyIcon');
    if (trophyEl && !trophyEl.children.length) {
      lottie.loadAnimation({ container: trophyEl, renderer: 'svg', loop: true, autoplay: true, path: 'assets/giftTrophy.json' });
    }
    const giftEl = document.getElementById('giftTabIcon');
    if (giftEl && !giftEl.children.length) {
      lottie.loadAnimation({ container: giftEl, renderer: 'svg', loop: true, autoplay: true, path: 'assets/giftHeart.json' });
    }

    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.leaderboard-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.leaderboard-list').forEach(l => l.classList.remove('active'));
        tab.classList.add('active');
        const type = tab.dataset.tab;
        STATE.currentLeaderboardTab = type;
        document.getElementById(`leaderboard-${type}`)?.classList.add('active');
        this.render(type);
      });
    });

    const retryBtn = document.getElementById('leaderboardRetryBtn');
    if (retryBtn && !retryBtn.dataset.bound) {
      retryBtn.dataset.bound = 'true';
      retryBtn.addEventListener('click', () => this.fetchData(true));
    }

    this.fetchData();
  },

  // ── Real data fetch ──
  // One request pulls all three lists + "your rank" so switching tabs
  // never has to re-fetch. Dedupes concurrent calls (e.g. init() firing
  // while a retry from the error state is still in flight).
  async fetchData(force = false) {
    if (this._fetchPromise && !force) return this._fetchPromise;

    STATE.leaderboardStatus = 'loading';
    this.setViewState('loading');

    const userId = STATE.tg?.initDataUnsafe?.user?.id;
    const url = `${DATA_STORE_URL}/leaderboard${userId ? `?user_id=${userId}` : ''}`;

    this._fetchPromise = (async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        STATE.leaderboardData = {
          coins: (data.coins || []).map(r => this._normalize(r, 'coins')),
          stars: (data.stars || []).map(r => this._normalize(r, 'stars')),
          gifts: (data.gifts || []).map(r => this._normalize(r, 'gifts'))
        };
        STATE.leaderboardYou = data.you || null;
        STATE.leaderboardStatus = 'ready';
        this.setViewState('ready');
        this.render(STATE.currentLeaderboardTab);

      } catch (err) {
        console.error('❌ Leaderboard fetch failed:', err);
        STATE.leaderboardStatus = 'error';
        this.setViewState('error');
      } finally {
        this._fetchPromise = null;
      }
    })();

    return this._fetchPromise;
  },

  // Maps a raw DB row (first_name/last_name/username/coins|stars|gifts)
  // into the { id, name, username, avatar, coins|stars|gifts } shape the
  // podium/rank card renderers expect.
  _normalize(row, type) {
    const name = row.last_name ? `${row.first_name || ''} ${row.last_name}`.trim()
                : (row.first_name || row.username || 'Player');
    return {
      id: row.user_id,
      name,
      username: row.username || null,
      avatar: row.avatar_url || null,
      coins: type === 'coins' ? Number(row.coins) || 0 : undefined,
      // The "stars" tab ranks by lifetime Stars SPENT (falls back to balance for an old server).
      stars: type === 'stars' ? Number(row.stars_spent ?? row.stars) || 0 : undefined,
      gifts: type === 'gifts' ? Number(row.gifts) || 0 : undefined
    };
  },

  // Swaps between the loading skeleton, the real lists, and the
  // "couldn't connect" duck state. All three states share the same
  // leaderboard-content area so switching tabs doesn't fight with them.
  setViewState(state) {
    const errorEl    = document.getElementById('leaderboardErrorState');
    const skeletonEl = document.querySelector('.leaderboard-skeleton');
    const rankCard   = document.querySelector('.your-rank-card');

    if (skeletonEl) skeletonEl.style.display = state === 'loading' ? 'flex' : 'none';

    if (errorEl) {
      errorEl.style.display = state === 'error' ? 'flex' : 'none';
      if (state === 'error' && !errorEl.dataset.animated) {
        const anim = errorEl.querySelector('.leaderboard-error-lottie');
        if (anim && typeof lottie !== 'undefined') {
          lottie.loadAnimation({ container: anim, renderer: 'svg', loop: true, autoplay: true, path: 'assets/CleaningDuck.json' });
        }
        errorEl.dataset.animated = 'true';
      }
    }

    // The active .leaderboard-list keeps its own .active display toggle
    // (used for tab switching) — here we just hide/show the whole group
    // for the loading/error states.
    document.querySelectorAll('.leaderboard-list').forEach(l => {
      l.style.display = (state === 'error' || state === 'loading') ? 'none' : '';
    });

    if (rankCard) rankCard.style.display = (state === 'error' || state === 'loading') ? 'none' : '';
  },

  render(type) {
    if (STATE.leaderboardStatus !== 'ready') return;

    const data =
      type === 'coins' ? STATE.leaderboardData.coins :
      type === 'stars' ? STATE.leaderboardData.stars :
      STATE.leaderboardData.gifts;
    const container = document.getElementById(`leaderboard-${type}`);
    if (!container) return;

    const podium = container.querySelector('.podium-container');
    const ranks  = container.querySelector('.ranks-list');
    if (podium) podium.innerHTML = '';
    if (ranks)  ranks.innerHTML  = '';

    if (!data.length) {
      if (ranks) ranks.innerHTML = `<div class="leaderboard-empty">${Utils.t('leaderboardEmpty')}</div>`;
    } else {
      data.slice(0, 3).forEach((p, i) => podium?.appendChild(this.createPodiumCard(p, i + 1, type)));
      data.slice(3).forEach((p, i)    => ranks?.appendChild(this.createRankCard(p, i + 4, type)));
    }
    this.updateYourRank(type);
  },

  _avatar(player, size) {
    const el = document.createElement('div');
    el.className = `${size}-avatar`;
    if (player.avatar) { el.style.backgroundImage = `url(${player.avatar})`; el.style.backgroundSize = 'cover'; }
    else { el.textContent = player.name.split(' ').map(n => n[0]).join('').substring(0, 2); }
    return el;
  },

  _scoreText(player, type) {
    if (type === 'coins') return player.coins.toLocaleString();
    if (type === 'stars') return `${player.stars.toLocaleString()} ⭐`;
    return `${player.gifts} ${Utils.t('tabGifts').toLowerCase()}`;
  },

  createPodiumCard(player, rank, type) {
    const card     = document.createElement('div');
    card.className = 'podium-card';
    card.setAttribute('data-rank', rank);
    const badge = document.createElement('div'); badge.className = 'podium-rank'; badge.textContent = rank;
    const name  = document.createElement('div'); name.className  = 'podium-name'; name.textContent  = player.name;
    const score = document.createElement('div'); score.className = 'podium-score';
    score.textContent = this._scoreText(player, type);
    card.append(badge, this._avatar(player, 'podium'), name, score);
    return card;
  },

  createRankCard(player, rank, type) {
    const card = document.createElement('div'); card.className = 'rank-card';
    const pos  = document.createElement('div'); pos.className  = 'rank-position'; pos.textContent = `#${rank}`;
    const info = document.createElement('div'); info.className = 'rank-info';
    const name  = document.createElement('div'); name.className  = 'rank-name';  name.textContent  = player.name;
    const score = document.createElement('div'); score.className = 'rank-score';
    score.textContent = this._scoreText(player, type);
    info.append(name, score);
    card.append(pos, this._avatar(player, 'rank'), info);
    return card;
  },

  // Rank/score come straight from the backend's "you" block now (it
  // already knows the caller's global position) rather than being
  // derived from whatever page of the list happens to be loaded.
  updateYourRank(type) {
    const user  = STATE.userData || { first_name: 'You' };
    const uName = user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
    const rankEl  = document.getElementById('yourRank');
    const nameEl  = document.getElementById('yourRankName');
    const scoreEl = document.getElementById('yourRankScore');
    if (!rankEl || !nameEl || !scoreEl) return;
    nameEl.textContent = uName;

    const you = STATE.leaderboardYou?.[type];
    if (you) {
      rankEl.textContent = you.hidden ? '—' : you.rank;
      const score = you.score;
      scoreEl.textContent =
        type === 'coins' ? `${score.toLocaleString()} ${Utils.t('tabCoins').toLowerCase()}` :
        type === 'stars' ? `${score.toLocaleString()} ⭐` :
        `${score} ${Utils.t('tabGifts').toLowerCase()}`;
      return;
    }

    // No signed-in Telegram user (fallback/dev mode) — fall back to local
    // balances with no computed rank, rather than showing stale/fake data.
    rankEl.textContent = '--';
    if (type === 'coins')      scoreEl.textContent = `${STATE.userCoins.toLocaleString()} ${Utils.t('tabCoins').toLowerCase()}`;
    else if (type === 'stars') scoreEl.textContent = `${(STATE.starsSpentTotal || 0).toLocaleString()} ⭐`;
    else                        scoreEl.textContent = `${STATE.inventoryItems.length} ${Utils.t('tabGifts').toLowerCase()}`;
  },

  updateData() {
    if (STATE.currentPage === 'leaderboard' && STATE.leaderboardStatus === 'ready') this.updateYourRank(STATE.currentLeaderboardTab);
  },

  // Re-render whatever's currently on screen with fresh translated strings.
  refreshLabels() {
    if (STATE.currentPage === 'leaderboard' && STATE.leaderboardStatus === 'ready') this.render(STATE.currentLeaderboardTab);
  }
};

// ============================================
// WALLETPICKER
// ============================================
const WalletPickerModal = {
  _resolve: null,

  _hide() {
    document.getElementById('walletPickerModal')?.classList.remove('show');
  },

  // Returns a Promise resolving to the chosen wallet object, or null if cancelled.
  open(wallets) {
    const modal = document.getElementById('walletPickerModal');
    const list  = document.getElementById('walletPickerList');
    if (!modal || !list || !wallets.length) return Promise.resolve(null);

    list.innerHTML = '';
    wallets.forEach(w => {
      const opt = document.createElement('div');
      opt.className = 'language-option';

      const icon = document.createElement('span');
      icon.className = 'language-flag';
      if (w.imageUrl) {
        const img = document.createElement('img');
        img.src = w.imageUrl;
        img.alt = w.name || '';
        img.style.cssText = 'width:28px;height:28px;object-fit:contain;border-radius:6px;';
        icon.appendChild(img);
      } else {
        icon.textContent = '💼';
      }

      const name = document.createElement('span');
      name.className = 'language-name';
      name.textContent = w.name || w.appName;

      opt.append(icon, name);
      opt.addEventListener('click', () => {
        this._hide();
        const resolve = this._resolve;
        this._resolve = null;
        resolve?.(w);
      });
      list.appendChild(opt);
    });

    modal.classList.add('show');
    return new Promise(resolve => { this._resolve = resolve; });
  },

  close() {
    this._hide();
    const resolve = this._resolve;
    this._resolve = null;
    resolve?.(null);
  },

  init() {
    document.getElementById('walletPickerClose')?.addEventListener('click', () => this.close());
    document.getElementById('walletPickerModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.close();
    });
  }
};

// ============================================
// TonWalletInit
// ============================================

// Builds a valid base64 BOC (Bag of Cells) for a plain-text TON transfer
// comment: a single ordinary cell containing a 32-bit zero opcode followed
// by the UTF-8 comment bytes, per the TON/TonConnect "text comment" format
// (docs.ton.org/v3/guidelines/ton-connect/guidelines/preparing-messages).
// Previously this repo base64-encoded raw bytes with no BOC framing, which
// wallets either rejected or silently dropped — meaning the reference
// comment never reached the chain and ton-payments.js could never match
// the deposit. Keep comments short (well under ~240 bytes) so the whole
// BOC still fits the 1-byte size/offset fields used below.
function buildCommentBoc(comment) {
  const textBytes = new TextEncoder().encode(comment);
  const n = textBytes.length;
  const dataLen = 4 + n; // 4 zero bytes (opcode) + comment bytes

  const d1 = 0x00;            // 0 refs, ordinary cell, level 0
  const d2 = dataLen * 2;     // byte-aligned data

  const cellBytes = new Uint8Array(2 + dataLen);
  cellBytes[0] = d1;
  cellBytes[1] = d2;
  cellBytes.set(textBytes, 2 + 4);

  const totCellsSize = cellBytes.length;

  const header = new Uint8Array([
    0xb5, 0xee, 0x9c, 0x72, // BOC magic
    0x01,                   // flags: size_bytes = 1
    0x01,                   // off_bytes = 1
    0x01,                   // cells_count
    0x01,                   // roots_count
    0x00,                   // absent_count
    totCellsSize,           // tot_cells_size
    0x00                    // root_list[0] = cell index 0
  ]);

  const boc = new Uint8Array(header.length + cellBytes.length);
  boc.set(header, 0);
  boc.set(cellBytes, header.length);

  let binary = '';
  boc.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

const TonWallet = {
  connector: null,
  address: null,
  // Metadata about the connected wallet app itself (name/icon/deep link) —
  // not part of the TonConnect session object, so we capture it ourselves
  // at connect time and persist it for restoreConnection() on reload.
  meta: null,

  init() {
    if (!window.TonConnectSDK) { console.warn('TonConnect SDK not loaded'); return; }
    this.connector = new window.TonConnectSDK.TonConnect({
      manifestUrl: 'https://sn0wydev.github.io/ProtV3/tonconnect-manifest.json' // ← real host URL
    });
    try { this.meta = JSON.parse(localStorage.getItem('tonWalletMeta') || 'null'); } catch { this.meta = null; }

    this.connector.onStatusChange(async wallet => {
      this.address = wallet ? window.TonConnectSDK.toUserFriendlyAddress(wallet.account.address) : null;
      if (!wallet) { this.meta = null; localStorage.removeItem('tonWalletMeta'); }
      else if (!this.meta) { await this._resolveMeta(wallet); } // e.g. restored session on a fresh page load
      this.updateUI();
    });
    this.connector.restoreConnection(); // picks up a session from a previous visit
  },

  // Backfills wallet app name/icon/deepLink by matching the session's
  // device.appName against the public wallets list — needed after
  // restoreConnection(), since the reconnect path never goes through
  // WalletPickerModal where we'd normally capture this directly.
  async _resolveMeta(wallet) {
    try {
      const appName = wallet?.device?.appName;
      if (!appName) return;
      const wallets = await this.connector.getWallets();
      const match = wallets.find(w => (w.appName || '').toLowerCase() === appName.toLowerCase());
      if (match) this._saveMeta(match);
    } catch (err) { console.error('TonWallet._resolveMeta failed:', err); }
  },

  _saveMeta(chosen) {
    this.meta = { name: chosen.name || chosen.appName, imageUrl: chosen.imageUrl || null, deepLink: chosen.deepLink || null };
    try { localStorage.setItem('tonWalletMeta', JSON.stringify(this.meta)); } catch { /* storage full/unavailable — non-fatal */ }
  },

  async connect() {
    if (!this.connector) return null;
    if (this.connector.connected) return this.address;

    const wallets = await this.connector.getWallets();
    if (!wallets.length) { Utils.showToast(Utils.t('noWalletFound'), 'error'); return null; }

    const chosen = await WalletPickerModal.open(wallets);
    if (!chosen) return null;

    return this._connectToWallet(chosen);
  },

  // Lets the user pick a different wallet WITHOUT touching the current
  // connection until a replacement is actually confirmed. Previously this
  // disconnected first, so cancelling the picker left the user with no
  // wallet connected at all — fixed by only swapping after a real choice.
  async switchWallet() {
    if (!this.connector) return null;

    const wallets = await this.connector.getWallets();
    if (!wallets.length) { Utils.showToast(Utils.t('noWalletFound'), 'error'); return this.address; }

    const chosen = await WalletPickerModal.open(wallets);
    if (!chosen) return this.address; // cancelled — keep whatever was connected, nothing lost

    if (this.connector.connected) await this.disconnect();
    return this._connectToWallet(chosen);
  },

  async _connectToWallet(chosen) {
    try {
      // A wallet advertising `jsBridgeKey` only means it *supports* a browser-extension
      // bridge on some platform — not that the extension is installed in THIS browser.
      // Tonkeeper is mostly a mobile app / deep link, so it has jsBridgeKey but
      // injected/embedded is false. Only take the bridge path when the extension is
      // actually live right now; otherwise fall back to the universal link.
      const isInjected = 'jsBridgeKey' in chosen && (chosen.injected || chosen.embedded);

      if (isInjected) {
        await this.connector.connect({ jsBridgeKey: chosen.jsBridgeKey });
      } else if ('universalLink' in chosen) {
        const link = this._withReturnStrategy(this.connector.connect({ universalLink: chosen.universalLink, bridgeUrl: chosen.bridgeUrl }));
        STATE.tg?.openLink ? STATE.tg.openLink(link) : window.open(link, '_blank');
      } else {
        Utils.showToast(Utils.t('noWalletFound'), 'error');
        return null;
      }
    } catch (err) {
      console.error('TonWallet.connect failed:', err);
      Utils.showToast(Utils.t('noWalletFound'), 'error');
      return null;
    }

    this._saveMeta(chosen);

    return new Promise(resolve => {
      let settled = false;
      const finish = (val) => { if (settled) return; settled = true; clearTimeout(timer); unsub?.(); resolve(val); };
      const unsub = this.connector.onStatusChange(wallet => {
        if (wallet) finish(this.address);
      });
      // If the user rejects in the wallet app, closes it, or never comes
      // back, onStatusChange never fires — without this the purchase
      // modal would spin on "Waiting for wallet connection…" forever.
      const timer = setTimeout(() => finish(null), 90000);
    });
  },

  // Best-effort: asks the wallet to return the user straight back here
  // after they approve/decline, instead of leaving them stranded in the
  // wallet app. Only meaningful inside Telegram; support varies by wallet
  // (this is a protocol-level hint, not a guarantee — see ton-connect/sdk#302).
  _withReturnStrategy(link) {
    if (!STATE.tg) return link;
    try {
      const u = new URL(link);
      u.searchParams.set('ret', 'back');
      return u.toString();
    } catch { return link; }
  },

  // Sends a plain TON transfer and returns the signed message's boc.
  // NOTE: this is not proof of an on-chain confirmation — see backend note below.
  async sendPayment(amountTon, merchantAddress, comment) {
    if (!this.connector?.connected) throw new Error('Wallet not connected');
    const nanotons = Math.round(amountTon * 1e9).toString();
    const message = { address: merchantAddress, amount: nanotons };
    if (comment) message.payload = buildCommentBoc(comment);

    // The confirmation screen itself can never be embedded in our page —
    // by design, only the wallet (which holds the private key) is allowed
    // to render that UI, otherwise a malicious page could fake a "Confirm"
    // button. What we CAN do is bring the wallet app to the foreground
    // immediately instead of waiting on a push notification to wake it.
    if (STATE.tg && this.meta?.deepLink) {
      try { STATE.tg.openLink(this.meta.deepLink); } catch { /* non-fatal — bridge push still covers it */ }
    }

    return this.connector.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [message]
    });
  },

  // Manual disconnect, triggered from the wallet-manage modal. onStatusChange
  // fires from this too, so UI updates through the normal path.
  async disconnect() {
    if (!this.connector?.connected) return;
    try { await this.connector.disconnect(); }
    catch (err) { console.error('TonWallet.disconnect failed:', err); }
  },

  updateUI() {
    const chip = document.getElementById('tonWalletChip');
    const label = document.getElementById('tonWalletChipLabel');
    if (chip) chip.classList.toggle('connected', !!this.address);
    if (label) label.textContent = this.address
      ? `${this.address.slice(0, 4)}…${this.address.slice(-4)}`
      : Utils.t('walletNotConnected');
  }
};

// ============================================
// TON WALLET MANAGE (chip -> address + disconnect)
// ============================================

const TonWalletManage = {
  open() {
    const modal = document.getElementById('tonWalletManageModal');
    const body = document.getElementById('tonWalletManageBody');
    if (!modal || !body) return;

    if (!TonWallet.address) { modal.classList.remove('show'); return; }

    body.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'ton-wallet-manage-header';

    const icon = document.createElement('div');
    icon.className = 'ton-wallet-manage-icon';
    const iconSrc = TonWallet.meta?.imageUrl || 'assets/TON.svg'; // same icon used for the TON deposit tab
    icon.innerHTML = `<img src="${iconSrc}" alt="">`;

    const name = document.createElement('div');
    name.className = 'ton-wallet-manage-name';
    name.textContent = TonWallet.meta?.name || 'TON Wallet';

    header.append(icon, name);

    const divider = document.createElement('div');
    divider.className = 'ton-purchase-divider';

    const pill = document.createElement('div');
    pill.className = 'ton-wallet-address-pill';
    pill.textContent = TonWallet.address;

    const disconnectBtn = document.createElement('button');
    disconnectBtn.className = 'ton-purchase-btn danger';
    disconnectBtn.textContent = Utils.t('disconnectWallet');
    disconnectBtn.addEventListener('click', async () => {
      await TonWallet.disconnect();
      modal.classList.remove('show');
      Utils.showToast(Utils.t('disconnected'), 'success');
    });

    body.append(header, divider, pill, disconnectBtn);
    modal.classList.add('show');
  },

  init() {
    document.getElementById('tonWalletChip')?.addEventListener('click', () => {
      if (TonWallet.address) this.open();
      // Not connected: the chip is just a status indicator — connecting
      // happens through the purchase flow, per design.
    });
    document.getElementById('tonWalletManageClose')?.addEventListener('click', () => {
      document.getElementById('tonWalletManageModal')?.classList.remove('show');
    });
    document.getElementById('tonWalletManageModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) e.currentTarget.classList.remove('show');
    });
  }
};

// ============================================
// TON PURCHASE FLOW
// A single guided modal: choose/connect a wallet -> pay -> wait for
// on-chain confirmation -> success/fail screen. Replaces the old flow
// where pressing Purchase gave no feedback until the wallet app popped up.
// ============================================

const TonPurchaseFlow = {
  _pkg: null,
  _closable: true,

  _modal()  { return document.getElementById('tonPurchaseModal'); },
  _body()   { return document.getElementById('tonPurchaseBody'); },
  _title(t) { const el = document.getElementById('tonPurchaseTitle'); if (el) el.textContent = t; },

  _show() { this._modal()?.classList.add('show'); },
  _hide() { if (this._closable) this._modal()?.classList.remove('show'); },

  _renderSpinner(text) {
    this._closable = false;
    this._body().innerHTML = '';
    const spinner = document.createElement('div');
    spinner.className = 'ton-purchase-spinner';
    const p = document.createElement('div');
    p.className = 'ton-purchase-subtitle';
    p.textContent = text;
    this._body().append(spinner, p);
  },

  _renderResult({ ok, title, desc, primaryLabel, onPrimary }) {
    this._closable = true;
    this._title(title);
    this._body().innerHTML = '';

    const icon = document.createElement('div');
    icon.className = `ton-purchase-icon ${ok ? 'success' : 'fail'}`;
    icon.innerHTML = ok
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>';

    const p = document.createElement('div');
    p.className = 'ton-purchase-subtitle';
    p.textContent = desc;

    const btn = document.createElement('button');
    btn.className = 'ton-purchase-btn';
    btn.textContent = primaryLabel;
    btn.addEventListener('click', onPrimary);

    this._body().append(icon, p, btn);
  },

  // Step shown every time: pay with the already-connected wallet, or
  // connect a different one. Matches "offer connected wallets or select
  // a new wallet app" from the design request.
  _renderChooseWallet() {
    this._closable = true;
    this._title(Utils.t('tonPurchaseTitle'));
    this._body().innerHTML = '';

    const amount = document.createElement('div');
    amount.className = 'ton-purchase-amount';
    amount.textContent = this._pkg.amountTon ?? this._pkg.amount;
    const unit = document.createElement('span');
    unit.textContent = `TON → ${this._pkg.stars} ⭐`;
    amount.appendChild(unit);
    this._body().appendChild(amount);

    if (TonWallet.address) {
      const payBtn = document.createElement('button');
      payBtn.className = 'ton-purchase-btn';
      payBtn.textContent = `${Utils.t('payWithWallet')} (${TonWallet.address.slice(0,4)}…${TonWallet.address.slice(-4)})`;
      payBtn.addEventListener('click', () => this._runPayment());

      const switchBtn = document.createElement('button');
      switchBtn.className = 'ton-purchase-btn secondary';
      switchBtn.textContent = Utils.t('useAnotherWallet');
      switchBtn.addEventListener('click', async () => {
        await TonWallet.switchWallet(); // only swaps if the user actually picks a new wallet — cancelling keeps the current one connected
        this._renderChooseWallet(); // re-render to reflect whichever wallet ends up connected
      });

      this._body().append(payBtn, switchBtn);
    } else {
      const connectBtn = document.createElement('button');
      connectBtn.className = 'ton-purchase-btn';
      connectBtn.textContent = Utils.t('connectAWallet');
      connectBtn.addEventListener('click', async () => {
        this._renderSpinner(Utils.t('connectingWallet'));
        const addr = await TonWallet.connect();
        if (addr) this._runPayment();
        else this._renderChooseWallet();
      });
      this._body().appendChild(connectBtn);
    }
  },

  async _runPayment() {
    const userId = STATE.tg?.initDataUnsafe?.user?.id;
    if (!userId) { Utils.showToast(Utils.t('userIdUnavailable'), 'error'); this._hide(); return; }

    try {
      this._renderSpinner(Utils.t('confirmInWalletApp'));

      const res = await fetch(`${TON_API_BASE}/ton/create-pending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId: this._pkg.id, walletAddress: TonWallet.address })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to create pending payment'); }
      const { reference, merchantWallet, amountTon } = await res.json();

      // Resolves once signed + broadcast — not on-chain confirmation yet.
      await TonWallet.sendPayment(amountTon, merchantWallet, reference);

      this._renderSpinner(Utils.t('waitingTonConfirmation'));
      const confirmed = await Deposit.waitForTonConfirmation(reference);

      if (confirmed) {
        const stars = await BackendAPI.claimTonCredits();
        this._renderResult({
          ok: true,
          title: Utils.t('tonPaymentSuccessTitle'),
          desc: Utils.t('tonPaymentSuccessDesc', { n: stars || this._pkg.stars }),
          primaryLabel: Utils.t('done'),
          onPrimary: () => this._hide()
        });
      } else {
        // Not confirmed within the polling window — not a failure. The
        // backend keeps watching for 30 min and syncBalance() picks the
        // credit up automatically the moment it lands.
        this._renderResult({
          ok: true,
          title: Utils.t('tonConfirmationPendingTitle'),
          desc: Utils.t('tonConfirmationPendingDesc'),
          primaryLabel: Utils.t('close'),
          onPrimary: () => this._hide()
        });
      }
    } catch (err) {
      const cancelled = String(err.message).toLowerCase().includes('reject');
      this._renderResult({
        ok: false,
        title: Utils.t('tonPaymentFailedTitle'),
        desc: cancelled ? Utils.t('paymentCancelled') : Utils.t('invoiceError', { msg: err.message }),
        primaryLabel: Utils.t('tryAgain'),
        onPrimary: () => this._renderChooseWallet()
      });
    }
  },

  open(pkg) {
    this._pkg = pkg;
    this._show();
    this._renderChooseWallet();
  },

  init() {
    document.getElementById('tonPurchaseClose')?.addEventListener('click', () => this._hide());
    document.getElementById('tonPurchaseModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this._hide();
    });
  }
};

// ============================================
// DEPOSIT
// ============================================


// ============================================
// NFT BUYBACK board  (Deposit > "Sell Gifts")
// ============================================
// Players send a collectible to the relayer; the relayer credits the Stars
// listed here. The AUTHORITATIVE prices live in the relayer's
// buyback-prices.json (served at GET {relayer}/buyback/prices); this file's
// BUYBACK_FALLBACK is only used if that request fails. Keep them in sync
// with tools/sync-buyback.js.
// Icons are pulled straight from assets/<Name without spaces/punctuation>.svg
// (e.g. "Crystal Ball" -> assets/CrystalBall.svg); if the .svg is missing it
// tries assets/<Name>.json (Lottie), then hides the icon.
// ============================================
const BUYBACK_FALLBACK = [
  ['Plush Pepe', 655799],
  ['Heart Locket', 132277],
  ['Durov\'s Cap', 41106],
  ['Resistance Dog', 31620],
  ['Precious Peach', 25049],
  ['Scared Cat', 24992],
  ['Heroic Helmet', 18629],
  ['Mighty Arm', 12993],
  ['Loot Bag', 12547],
  ['Astral Shard', 11713],
  ['Nail Bracelet', 11571],
  ['Westside Sign', 10433],
  ['Mini Oscar', 7041],
  ['Perfume Bottle', 6942],
  ['Ion Gem', 6724],
  ['Artisan Brick', 6435],
  ['Gem Signet', 6123],
  ['Low Rider', 5839],
  ['Swiss Watch', 5524],
  ['Magic Potion', 5457],
  ['Sharp Tongue', 4530],
  ['Bonded Ring', 4230],
  ['Kissed Frog', 3958],
  ['Vintage Cigar', 3773],
  ['Voodoo Doll', 3770],
  ['Neko Helmet', 3737],
  ['Genie Lamp', 3540],
  ['Toy Bear', 3419],
  ['Signet Ring', 3268],
  ['Diamond Ring', 3103],
  ['Rare Bird', 2795],
  ['Electric Skull', 2688],
  ['Bling Binky', 2541],
  ['Eternal Rose', 2508],
  ['Khabib\'s Papakha', 2409],
  ['Cupid Charm', 2235],
  ['Lucky Locket', 1935],
  ['Sky Stilettos', 1908],
  ['UFC Strike', 1693],
  ['Trapped Heart', 1598],
  ['Snoop Cigar', 1528],
  ['Love Potion', 1493],
  ['Ionic Dryer', 1462],
  ['Mad Pumpkin', 1397],
  ['Crystal Ball', 1299],
  ['Flying Broom', 1265],
  ['Record Player', 1254],
  ['Skull Flower', 1237],
  ['Valentine Box', 1129],
  ['Love Candle', 1075],
  ['Top Hat', 1068],
  ['Sakura Flower', 1053],
  ['Jingle Bells', 969],
  ['Hanging Star', 954],
  ['Fine Pen', 894],
  ['Berry Box', 870],
  ['Bunny Muffin', 852],
  ['Joyful Bundle', 800],
  ['Jelly Bunny', 777],
  ['Evil Eye', 764],
  ['Jolly Chimp', 736],
  ['Sleigh Bell', 735],
  ['Surge Board', 700],
  ['Witch Hat', 671],
  ['Light Sword', 663],
  ['Input Key', 645],
  ['Lush Bouquet', 625],
  ['Moon Pendant', 615],
  ['Bow Tie', 596],
  ['Eternal Candle', 596],
  ['Snoop Dogg', 589],
  ['Spy Agaric', 587],
  ['Spring Basket', 584],
  ['Faith Amulet', 544],
  ['Santa Hat', 541],
  ['Snow Globe', 541],
  ['Restless Jar', 539],
  ['Pretty Posy', 537],
  ['Swag Bag', 532],
  ['Snow Mittens', 526],
  ['Desk Calendar', 522],
  ['Stellar Rocket', 516],
  ['Money Pot', 514],
  ['Homemade Cake', 513],
  ['Clover Pin', 501],
  ['Cookie Heart', 492],
  ['Liberty Figure', 492],
  ['B-Day Candle', 488],
  ['Mirage Lamp', 487],
  ['Mousse Cake', 485],
  ['Hex Pot', 484],
  ['Jack-in-the-Box', 482],
  ['Star Notepad', 468],
  ['Victory Medal', 452],
  ['Timeless Book', 450],
  ['Spiced Wine', 439],
  ['Fresh Socks', 439],
  ['Party Sparkler', 438],
  ['Ginger Cookie', 438],
  ['Mood Pack', 429],
  ['Winter Wreath', 421],
  ['Holiday Drink', 417],
  ['Hypno Lollipop', 414],
  ['Easter Egg', 409],
  ['Tama Gadget', 405],
  ['Happy Brownie', 404],
  ['Jester Hat', 403],
  ['Lol Pop', 397],
  ['Pet Snake', 395],
  ['Whip Cupcake', 387],
  ['Ice Cream', 385],
  ['Big Year', 384],
  ['Lunar Snake', 383],
  ['Candy Cane', 383],
  ['Pool Float', 383],
  ['Vice Cream', 382],
  ['Instant Ramen', 381],
  ['Chill Flame', 379],
  ['Snake Box', 379],
  ['Xmas Stocking', 378]
];

const Buyback = {
  items: BUYBACK_FALLBACK.map(([title, stars]) => ({ title, stars })),
  relayer: 'VoidGift_Relayer',
  query: '',
  _timer: null,

  // Older file names for icons that already exist in /assets.
  ICON_ALIASES: { DeskCalendar: 'Calender', LolPop: 'Lollipop', FreshSocks: 'Socks' },

  iconName(title) { return String(title).replace(/[^A-Za-z0-9]/g, ''); },

  async init() {
    if (this._inited) return;
    this._inited = true;
    const search = document.getElementById('sellSearch');
    search?.addEventListener('input', () => { this.query = search.value.trim().toLowerCase(); this.render(); });
    document.getElementById('sellOpenRelayer')?.addEventListener('click', () => {
      const url = `https://t.me/${this.relayer}`;
      if (STATE.tg?.openTelegramLink) STATE.tg.openTelegramLink(url); else window.open(url, '_blank');
    });
    this.render();
    this.fetchPrices();
  },

  async fetchPrices() {
    try {
      const res = await fetch(`${GIFT_RELAYER_URL}/buyback/prices`, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length) this.items = data.items.map(i => ({ title: i.title, stars: Number(i.stars) || 0 }));
      if (data.relayer_username) this.relayer = data.relayer_username;
      this.render();
    } catch { /* keep fallback */ }
  },

  _icon(title) {
    const wrap = document.createElement('div');
    wrap.className = 'sell-icon';
    const base = `assets/${this.iconName(title)}`;
    const img = Object.assign(document.createElement('img'), { src: `${base}.svg`, alt: '', loading: 'lazy' });
    img.addEventListener('error', function onErr() {
      // Reuse the three icons that already exist under their older file names.
      const alias = this.ICON_ALIASES?.[this.iconName(title)];
      if (alias && !img.dataset.triedAlias) {
        img.dataset.triedAlias = '1';
        img.addEventListener('error', onErr, { once: true });
        img.src = `assets/${alias}.svg`;
        return;
      }
      if (!img.dataset.triedJson && typeof lottie !== 'undefined') {
        img.dataset.triedJson = '1';
        img.remove();
        try { lottie.loadAnimation({ container: wrap, renderer: 'svg', loop: true, autoplay: true, path: `${base}.json` }); } catch { /* no icon */ }
      } else { img.remove(); }
    }.bind(this), { once: true });
    wrap.appendChild(img);
    return wrap;
  },

  render() {
    const list = document.getElementById('sellList');
    if (!list) return;
    const q = this.query;
    const rows = this.items
      .filter(i => !q || i.title.toLowerCase().includes(q))
      .sort((a, b) => b.stars - a.stars);
    list.innerHTML = '';
    const count = document.getElementById('sellCount');
    if (count) count.textContent = `${this.items.length} ${Utils.t('sellCount')}`;
    if (!rows.length) {
      list.innerHTML = `<div class="leaderboard-empty">${Utils.t('sellNoResults')}</div>`;
      return;
    }
    const frag = document.createDocumentFragment();
    rows.forEach(item => {
      const row = document.createElement('div');
      row.className = 'sell-row';
      const name = Object.assign(document.createElement('div'), { className: 'sell-name', textContent: item.title });
      const pill = document.createElement('div');
      pill.className = 'sell-pill';
      pill.innerHTML = `<span>+${item.stars.toLocaleString()}</span><img src="assets/TStars.svg" alt="Stars">`;
      row.append(this._icon(item.title), name, pill);
      frag.appendChild(row);
    });
    list.appendChild(frag);
  },

  relabel() {
    document.querySelectorAll('[data-sell-relayer]').forEach(el => { el.textContent = Utils.t(el.dataset.sellRelayer, { relayer: this.relayer }); });
    this.render();
  },

  // While the sell tab is open, poll the balance so Stars credited by the
  // relayer show up without reopening the app.
  onShow() {
    this.relabel();
    BackendAPI.syncBalance();
    clearInterval(this._timer);
    this._timer = setInterval(() => { if (STATE.currentPage === 'deposit' && STATE.currentDepositTab === 'sell') BackendAPI.syncBalance(); else this.onHide(); }, 6000);
  },
  onHide() { clearInterval(this._timer); this._timer = null; }
};

const Deposit = {
  init() {
    this.initTabs();
    this.renderPackages('stars');
    this.renderPackages('ton');
    this.initIcons();
    Buyback.init();
  },

  initTabs() {
    const tabsContainer = document.querySelector('.deposit-tabs');
    if (!tabsContainer || tabsContainer.dataset.bound) return;
    tabsContainer.dataset.bound = 'true';

    tabsContainer.addEventListener('click', (e) => {
      const tab = e.target.closest('.deposit-tab');
      if (!tab) return;

      document.querySelectorAll('.deposit-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.deposit-list').forEach(l => l.classList.remove('active'));
    
      tab.classList.add('active');
      const type = tab.dataset.tab;
      STATE.currentDepositTab = type;
      document.getElementById(`deposit-${type}`)?.classList.add('active');
      // The "Spent ... deposit info" card is about buying; hide it on the sell tab.
      document.querySelector('.deposit-info-card')?.classList.toggle('hidden', type === 'sell');
      if (type === 'sell') Buyback.onShow(); else Buyback.onHide();
    });
  },

  renderPackages(type) {
    const grid = document.querySelector(`#deposit-${type} .packages-grid`);
    if (!grid) return;
    grid.innerHTML = '';
    DEPOSIT_PACKAGES[type].forEach((pkg, i) => grid.appendChild(this.createCard(pkg, type, i)));
  },

  createCard(pkg, type, index) {
    const card = document.createElement('div');
    card.className = 'package-card';
    card.style.animationDelay = `${index * 0.05}s`;

    if (pkg.popular) {
      const badge = Object.assign(document.createElement('div'), { className: 'popular-badge', textContent: Utils.t('popular') });
      card.appendChild(badge);
    }

    const icon = document.createElement('div');
    icon.className = 'package-icon';
    icon.id = `pkg-${type}-${index}`;
    if (type === 'ton') {
      const img = Object.assign(document.createElement('img'), { src: 'assets/TON.svg', alt: 'TON' })
      img.style.cssText = 'width:100%;height:100%;object-fit:contain';
      icon.appendChild(img);
    }
    card.appendChild(icon);

    const amt = Object.assign(document.createElement('div'), { className: 'package-amount', textContent: pkg.amount.toLocaleString() });
    const cur = Object.assign(document.createElement('div'), {
      className: 'package-currency',
      textContent: type === 'ton' ? 'TON' : Utils.t('starsWord')
    });
    const div = document.createElement('div'); div.className = 'package-divider';

    const coins = document.createElement('div'); coins.className = 'package-coins';
    coins.innerHTML = `<img src="assets/TStars.svg" alt="Star"><span>${pkg.stars.toLocaleString()} ${Utils.t('starsWord')}</span>`;

    const btn = Object.assign(document.createElement('button'), { className: 'package-buy-btn', textContent: Utils.t('purchase') });
    btn.addEventListener('click', () => this.purchasePackage(pkg, type));

    card.append(amt, cur, div, coins, btn);
    return card;
  },

  async purchasePackage(pkg, type) {
    if (type === 'ton') return this.purchaseWithTon(pkg);
    
    if (!STATE.tg) { Utils.showToast(Utils.t('telegramWebAppUnavailable'), 'error'); return; }
    const userId = STATE.tg.initDataUnsafe?.user?.id;
    if (!userId)  { Utils.showToast(Utils.t('userIdUnavailable'), 'error'); return; }

    Utils.showToast(Utils.t('creatingInvoice'), 'success');

    try {
      const res = await fetch(`${INVOICE_API_BASE}/create-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId: pkg.id })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to create invoice'); }
      const data = await res.json();
      if (!data.invoiceLink) throw new Error('No invoice link received');

      STATE.tg.openInvoice(data.invoiceLink, async (status) => {
        if (status === 'paid') {
          Utils.showToast(Utils.t('paymentSuccessAdding', { n: pkg.stars }), 'success');
          BackendAPI.waitForStarCredits(pkg.stars);
        } else if (status === 'cancelled') {
          Utils.showToast(Utils.t('paymentCancelled'), 'error');
        } else if (status === 'failed') {
          Utils.showToast(Utils.t('paymentFailed'), 'error');
        }
      });
    } catch (error) {
      Utils.showToast(Utils.t('invoiceError', { msg: error.message }), 'error');
    }
  },

  purchaseWithTon(pkg) {
    TonPurchaseFlow.open(pkg);
  },

  // Polls GET /ton/status/:reference until the backend's on-chain watcher
  // confirms the transfer (or the payment expires). Returns false on
  // timeout — that's a "still waiting" outcome, not a failure.
  async waitForTonConfirmation(reference, { intervalMs = 4000, timeoutMs = 90000 } = {}) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`${TON_API_BASE}/ton/status/${reference}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'confirmed') return true;
          if (data.status === 'expired') return false;
        }
      } catch { /* transient network hiccup — just retry next tick */ }
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return false;
  },
  
  initIcons() {
    setTimeout(() => {
      const starsTabEl = document.getElementById('starsTabIcon');
      if (starsTabEl && !starsTabEl.children.length) {
        lottie.loadAnimation({ container: starsTabEl, renderer: 'svg', loop: true, autoplay: true, path: 'assets/TStars.json' });
      }
      DEPOSIT_PACKAGES.stars.forEach((_, i) => {
        const el = document.getElementById(`pkg-stars-${i}`);
        if (el && !el.children.length) {
          lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: true, path: 'assets/TStars.json' });
        }
      });
    }, 500);
  },

  // Re-render currently visible packages so "Popular"/"Purchase"/"Stars" pick up the new language.
  refreshLabels() {
    if (STATE.currentPage === 'deposit' && STATE.currentDepositTab !== 'sell') this.renderPackages(STATE.currentDepositTab);
    Buyback.relabel();
  }
};

// ============================================
// SPIN WHEEL (Daily Spin — original wheel, unchanged)
// ============================================

const SpinWheel = {
  init() {
    this.populateCubes();
    this.startAnimation();
    this.loadIcons();
    this.initCooldown();
  },

  // ── Daily cooldown (24h) ──
  // Stored as the timestamp of the last spin via BackendAPI (Telegram
  // CloudStorage + localStorage, same as coins/stars). The cooldown starts
  // when the spin is accepted, not at claim, so reloading mid-spin can't be
  // used to re-roll the prize.
  initCooldown() {
    this.cooldownReady = (GameAPI._firstRefresh || Promise.resolve()).then(() => this.updateCooldownUI());
    setInterval(() => this.updateCooldownUI(), 1000);
  },

  cooldownRemaining() {
    // Server-driven: dailyReadyAt = (our clock) + remaining_ms reported by the server.
    return Math.max(0, Math.min((STATE.dailyReadyAt || 0) - Date.now(), CONFIG.DAILY_COOLDOWN_MS));
  },

  formatRemaining(ms) {
    const s   = Math.ceil(ms / 1000);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  },

  // Gray state is only applied while idle — during a spin / win modal the
  // wheel keeps its normal colors, it greys out after the claim.
  updateCooldownUI() {
    const left = this.cooldownRemaining();
    this._cooling = left > 0 && !STATE.isSpinning;
    document.querySelector('.content-box-left-1')?.classList.toggle('is-cooldown', this._cooling);
    document.getElementById('page-dailyspin')?.classList.toggle('is-cooldown', this._cooling);
    document.getElementById('spinButton')?.setAttribute('aria-disabled', String(this._cooling));
    const t = document.getElementById('dailyCardTimerValue');
    if (t && left > 0) t.textContent = this.formatRemaining(left);
  },

  // Returns true (and shows the toast) while the gift is still cooling down.
  notifyIfCooldown() {
    const left = this.cooldownRemaining();
    if (left <= 0) return false;
    const now = Date.now();
    if (now - (this._lastCooldownToast || 0) > 2300) {   // toast lives 2.2s — don't stack on rapid taps
      this._lastCooldownToast = now;
      Utils.showToast(Utils.t('dailyOnCooldown', { time: this.formatRemaining(left) }), 'error');
    }
    return true;
  },

  startCooldown() {
    STATE.dailyReadyAt = Date.now() + CONFIG.DAILY_COOLDOWN_MS;
  },

  // Picks the REAL outcome. Only ever called from spin() to determine
  // what the player actually wins.
  selectPrize() {
    const r = Math.random() * 100;
    let cum = 0;
    for (const p of SPIN_PRIZES) { cum += p.chance; if (r <= cum) return p; }
    return SPIN_PRIZES[0];
  },

  // Picks a DISPLAY-ONLY prize from PREVIEW_PRIZES. Used for the idle
  // wheel and the pre-reveal repaint so the reel looks more generous
  // than the true odds. Never used to decide what the player wins.
  selectPreviewPrize() {
    const r = Math.random() * 100;
    let cum = 0;
    for (const p of PREVIEW_PRIZES) { cum += p.chance; if (r <= cum) return p; }
    return PREVIEW_PRIZES[0];
  },

  populateCubes() {
    document.querySelectorAll('#wheel .cube').forEach(c => this.renderCube(c, this.selectPreviewPrize()));
  },

  renderCube(cube, prize) {
    this._cleanupLottie(cube);
    cube.dataset.prizeId    = prize.id;
    cube.dataset.prizeType  = prize.type;
    cube.dataset.prizeValue = prize.value;
    if (!cube.dataset.cubeId) cube.dataset.cubeId = `cube_${Math.random().toString(36).slice(2,11)}`;
    cube.innerHTML = '';
    cube.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;';

    if (prize.type === 'coin') {
      const img = Object.assign(document.createElement('img'), { src: 'assets/Coin.svg', alt: 'Coin' });
      img.style.cssText = 'width:70px;height:70px;object-fit:contain;margin:auto';
      const txt = document.createElement('div');
      txt.textContent = prize.value;
      txt.style.cssText = 'position:absolute;top:15%;left:25%;transform:translate(-50%,-50%);font-size:1.5rem;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.8);pointer-events:none';
      cube.append(img, txt);
    } else {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'width:80px;height:80px;margin:auto';
      cube.appendChild(wrap);
      const inst = lottie.loadAnimation({
        container: wrap, renderer: 'svg', loop: true, autoplay: true, path: prize.lottie,
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice', clearCanvas: true, progressiveLoad: true }
      });
      STATE.lottieInstances.set(cube.dataset.cubeId, inst);
    }
  },

  _cleanupLottie(cube) {
    const id = cube.dataset.cubeId;
    if (id && STATE.lottieInstances.has(id)) {
      STATE.lottieInstances.get(id).destroy();
      STATE.lottieInstances.delete(id);
    }
  },

  updateScales(cubes) {
    const now = Date.now();
    if (now - STATE.lastScaleUpdate < 16 && STATE.isSpinning) return;
    STATE.lastScaleUpdate = now;
    const wc = document.querySelector('.wheel-container:not(.void-wheel-container)');
    if (!wc) return;
    const center = wc.offsetWidth / 2;
    const wRect  = wc.getBoundingClientRect();
    cubes.forEach(cube => {
      const cRect = cube.getBoundingClientRect();
      const dist  = Math.abs(cRect.left + cRect.width / 2 - wRect.left - center);
      const scale = Math.max(0.6, 1.5 - (dist / center) * 0.9);
      cube.style.transform   = `scale(${scale})`;
      // gray outlines while the daily gift is on cooldown, ember otherwise
      const rgb = this._cooling ? '170,170,185' : '255,178,91';
      cube.style.borderColor = scale > 1.3 ? `rgba(${rgb},0.85)` : `rgba(${rgb},0.3)`;
      cube.style.boxShadow   = scale > 1.3 ? `0 0 30px rgba(${rgb},${this._cooling ? 0.2 : 0.45})` : 'none';
    });
  },

  startAnimation() {
  let lastTime = performance.now();
  const animate = (now) => {
    // Clamp dt so a backgrounded tab / huge stall doesn't cause a
    // giant catch-up teleport when it resumes.
    const dt = Math.min(now - lastTime, 100);
    lastTime = now;

    const wheel = document.getElementById('wheel');
    if (wheel) {
      // scrollSpeed was tuned as "px per frame" at 60fps.
      // Scale by real elapsed time so total distance traveled depends
      // only on wall-clock duration, never on how many frames fired.
      STATE.scrollPosition += STATE.scrollSpeed * (dt / (1000 / 60));
      const stride = CONFIG.CUBE_WIDTH + CONFIG.GAP_WIDTH;

      // while, not if — a lag spike can cross more than one cube-width
      // in a single frame; recycle all of them so the reel never sticks.
      while (STATE.scrollPosition >= stride) {
        const first = document.querySelector('#wheel .cube');
        if (!first) break;
        wheel.appendChild(first);
        STATE.scrollPosition -= stride;
        if (!STATE.isSpinning) this.renderCube(first, this.selectPreviewPrize());
      }

      wheel.style.transform = `translateX(-${STATE.scrollPosition}px)`;
      this.updateScales(Array.from(document.querySelectorAll('#wheel .cube')));
    }
    STATE.animationFrameId = requestAnimationFrame(animate);
  };
  STATE.animationFrameId = requestAnimationFrame(animate);
},

  async spin() {
    if (STATE.isSpinning) return;
    if (this.notifyIfCooldown()) return;
    STATE.isSpinning = true;
    const btn = document.getElementById('spinButton');
    if (btn) btn.disabled = true;

    // The server enforces the cooldown, rolls the prize and grants it.
    let res;
    try {
      res = await GameAPI.daily();
    } catch (e) {
      STATE.isSpinning = false;
      if (btn) btn.disabled = false;
      GameAPI.handleError(e, { btn });
      return;
    }
    GameAPI.pending = { balance: res.balance };
    const winning = GameAPI.toPrize('daily', res.results[0]);
    const cubes   = Array.from(document.querySelectorAll('#wheel .cube'));
    if (!cubes.length) { STATE.isSpinning = false; if (btn) btn.disabled = false; return; }

    this.startCooldown();
    this.updateCooldownUI();

    cubes.forEach(c => { this._cleanupLottie(c); this.renderCube(c, this.selectPrize()); });

    const stride   = CONFIG.CUBE_WIDTH + CONFIG.GAP_WIDTH;
    const minDist  = 5000 + Math.random() * 600;
    const winIdx   = Math.floor(minDist / stride) % cubes.length;
    this.renderCube(cubes[winIdx], winning);

    const startTime = Date.now();
    const tick = () => {
      if (!STATE.isSpinning) return;
      const progress  = Math.min((Date.now() - startTime) / CONFIG.SPIN_DURATION, 1);
      STATE.scrollSpeed = CONFIG.SPIN_MAX_SPEED * (1 - (1 - Math.pow(1 - progress, 4)));
      if (progress < 1) { requestAnimationFrame(tick); }
      else { STATE.scrollSpeed = 0; setTimeout(() => this.snapToCenter(), 100); }
    };
    tick();
  },

  snapToCenter() {
    const cubes = Array.from(document.querySelectorAll('#wheel .cube'));
    const wc    = document.querySelector('.wheel-container:not(.void-wheel-container)');
    if (!wc) return;
    const center = wc.offsetWidth / 2;
    const wRect  = wc.getBoundingClientRect();
    let bestCube = null, bestDist = Infinity, snapDelta = 0;

    cubes.forEach(c => {
      const r    = c.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - wRect.left - center);
      if (dist < bestDist) { bestDist = dist; bestCube = c; snapDelta = (r.left + r.width / 2 - wRect.left) - center; }
    });

    const startPos = STATE.scrollPosition;
    const startT   = Date.now();
    const snap = () => {
      const p = Math.min((Date.now() - startT) / 400, 1);
      const e = 1 - Math.pow(1 - p, 3);
      STATE.scrollPosition = startPos + snapDelta * e;
      if (p < 1) { requestAnimationFrame(snap); return; }
      if (bestCube) {
        bestCube.style.transition = 'all .3s ease';
        bestCube.style.borderColor = '#ffb25b';
        bestCube.style.boxShadow   = '0 0 40px rgba(255,178,91,.75)';
        setTimeout(() => { if (bestCube) bestCube.style.transition = ''; }, 300);
        const final = SPIN_PRIZES.find(p => p.id === bestCube.dataset.prizeId);
        if (final) setTimeout(() => this.showWin(final), 200);
      }
    };
    snap();
  },

  showWin(prize) {
    STATE.currentWinningPrize = prize;
    GameAPI.settle([prize]);
    const modal    = document.getElementById('winModal');
    const iconEl   = document.getElementById('modalPrizeIcon');
    const nameEl   = document.getElementById('modalPrizeName');
    const valueRow = document.getElementById('modalValueRow');
    if (!modal || !iconEl || !nameEl) return;

    iconEl.innerHTML = '';

    if (prize.type === 'coin') {
      const img = Object.assign(document.createElement('img'), { src: 'assets/Coin.svg', alt: 'Coins' });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;animation:prizeFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 12px 32px rgba(245,194,107,.4))';
      iconEl.appendChild(img);
      nameEl.innerHTML = `<span class="hl">${prize.value}</span> ${Utils.t('coinsWord')}`;
      if (valueRow) {
        valueRow.innerHTML = `<img src="assets/Coin.svg" alt="Coins" style="width:22px;height:22px"><span>${prize.value} ${Utils.t('coinsWord')}</span>`;
        valueRow.style.display = 'flex';
      }
    } else {
      const img = document.createElement('img');
      img.src = GIFT_SVG_ICONS[prize.value] ?? '';
      img.alt = prize.value;
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;animation:prizeFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 12px 32px rgba(245,194,107,.4))';
      iconEl.appendChild(img);
      nameEl.innerHTML = `the <span class="hl">${prize.value}</span>`;
      if (valueRow) {
        const val = PRIZE_COIN_VALUES[prize.value] ?? 50;
        valueRow.innerHTML = `<img src="assets/Coin.svg" alt="Coins" style="width:22px;height:22px"><span>${val.toLocaleString()} ${Utils.t('coinsValue')}</span>`;
        valueRow.style.display = 'flex';
      }
    }

    modal.classList.add('show');
  },

  hideWin() {
    const modal = document.getElementById('winModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => {
      const el = document.getElementById('modalPrizeIcon');
      if (el) el.innerHTML = '';
    }, 300);
  },

  async claimWin() {
    // Guard: same pattern as convert(). Capture the prize, clear the shared
    // state immediately — BEFORE the await below — so a click landing
    // inside that network round-trip has nothing left to claim.
    if (!STATE.currentWinningPrize) return;
    const prize = STATE.currentWinningPrize;
    STATE.currentWinningPrize = null;

    const claimBtn = document.getElementById('claimButton');
    if (claimBtn) claimBtn.disabled = true;

    // Already granted by the server when the reel stopped — Claim just closes the card.

    this.hideWin();

    document.querySelectorAll('#wheel .cube').forEach(c => this._cleanupLottie(c));
    this.populateCubes();
    STATE.scrollSpeed = 1;
    STATE.isSpinning  = false;
    this.updateCooldownUI();
    if (claimBtn) claimBtn.disabled = false;
    const spinBtn = document.getElementById('spinButton');
    if (spinBtn) spinBtn.disabled = false;
  },

  loadIcons() {
    ['coin1','coin5','coin10','coin25','coin50','coin100','coin250','coin500'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const img = Object.assign(document.createElement('img'), { src: 'assets/Coin.svg', alt: 'Coin' });
      el.appendChild(img);
    });
    [
      ['giftHeart','Heart'], ['giftBear','Bear'],
      ['giftGift','Gift'],   ['giftRose','Rose'],
      ['giftCake','Cake'],   ['giftRoseBouquet','Rose Bouquet'],
      ['giftRing','Ring'],   ['giftTrophy','Trophy'],
      ['giftDiamond','Diamond'], ['giftCalendar','Calendar']
    ].forEach(([id, giftName]) => {
      const el = document.getElementById(id);
      if (el) {
        const img = Object.assign(document.createElement('img'), {
          src: GIFT_SVG_ICONS[giftName] ?? '',
          alt: giftName
        });
        img.style.cssText = 'width:100%;height:100%;object-fit:contain';
        el.appendChild(img);
      }
    });
  }
};

// ============================================
// VOID SPIN WHEEL — second wheel, home-page banner.
//
// Deliberately duplicated from SpinWheel above rather than merged into
// it: every wheel-specific piece (cubes, reel, spin/claim buttons, win
// modal id) uses "void" prefixed classes/ids and its own STATE.void*
// fields, so a spin on one wheel can never stomp the other's animation
// mid-flight. Everything downstream (Inventory, PrizeModal, notifications,
// leaderboard) is untouched — it already keys off prize.type/prize.value,
// not which wheel produced the prize.
//
// Gift cubes here render with the flat GIFT_SVG_ICONS art (no Lottie) —
// Lottie JSON only exists for the 10 original gifts and none of the 3
// new Void-exclusive ones have it. `lottie` stays set on those prize
// objects anyway purely as the truthy flag the generic inventory/modal/
// notification code checks for — it's never actually loaded as an
// animation from here.
//
// Cost: CONFIG.VOID_SPIN_COST Stars, deducted the instant Spin is
// pressed (not on claim). Insufficient balance blocks the spin with a
// toast + a quick shake on the button, no cubes move.
// ============================================

const VoidSpinWheel = {
  init() {
    this.populateCubes();
    this.startAnimation();
    this.loadIcons();
  },

  selectPrize() {
    const r = Math.random() * 100;
    let cum = 0;
    for (const p of VOID_SPIN_PRIZES) { cum += p.chance; if (r <= cum) return p; }
    return VOID_SPIN_PRIZES[0];
  },

  selectPreviewPrize() {
    const r = Math.random() * 100;
    let cum = 0;
    for (const p of VOID_PREVIEW_PRIZES) { cum += p.chance; if (r <= cum) return p; }
    return VOID_PREVIEW_PRIZES[0];
  },

  populateCubes() {
    document.querySelectorAll('.void-cube').forEach(c => this.renderCube(c, this.selectPreviewPrize()));
  },

  renderCube(cube, prize) {
    this._cleanupLottie(cube);
    cube.dataset.prizeId    = prize.id;
    cube.dataset.prizeType  = prize.type;
    cube.dataset.prizeValue = prize.value;
    if (!cube.dataset.cubeId) cube.dataset.cubeId = `voidcube_${Math.random().toString(36).slice(2,11)}`;
    cube.innerHTML = '';
    cube.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;';

    if (prize.type === 'coin' || prize.type === 'stars') {
      const img = Object.assign(document.createElement('img'), {
        src: prize.type === 'coin' ? 'assets/Coin.svg' : 'assets/TStars.svg',
        alt: prize.type === 'coin' ? 'Coin' : 'Stars'
      });
      img.style.cssText = 'width:70px;height:70px;object-fit:contain;margin:auto';
      const txt = document.createElement('div');
      txt.textContent = prize.value;
      txt.style.cssText = 'position:absolute;top:15%;left:25%;transform:translate(-50%,-50%);font-size:1.5rem;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.8);pointer-events:none';
      cube.append(img, txt);
    } else {
      // Gift — flat SVG, no lottie (see file-header note above).
      const wrap = document.createElement('div');
      wrap.style.cssText = 'width:80px;height:80px;margin:auto';
      const img = Object.assign(document.createElement('img'), {
        src: GIFT_SVG_ICONS[prize.value] ?? '',
        alt: prize.value
      });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain';
      wrap.appendChild(img);
      cube.appendChild(wrap);
    }
  },

  // No-op today (gift cubes don't load lottie instances here), kept so
  // the recycle/spin code paths mirror SpinWheel exactly and stay a
  // drop-in copy if Lottie assets get added for these gifts later.
  _cleanupLottie(cube) {
    const id = cube.dataset.cubeId;
    if (id && STATE.voidLottieInstances.has(id)) {
      STATE.voidLottieInstances.get(id).destroy();
      STATE.voidLottieInstances.delete(id);
    }
  },

  updateScales(cubes) {
    const now = Date.now();
    if (now - STATE.voidLastScaleUpdate < 16 && STATE.voidIsSpinning) return;
    STATE.voidLastScaleUpdate = now;
    const wc = document.querySelector('.void-wheel-container');
    if (!wc) return;
    const center = wc.offsetWidth / 2;
    const wRect  = wc.getBoundingClientRect();
    cubes.forEach(cube => {
      const cRect = cube.getBoundingClientRect();
      const dist  = Math.abs(cRect.left + cRect.width / 2 - wRect.left - center);
      const scale = Math.max(0.6, 1.5 - (dist / center) * 0.9);
      cube.style.transform   = `scale(${scale})`;
      cube.style.zIndex      = scale > 1.3 ? '5' : '1';
      cube.style.borderColor = scale > 1.3 ? 'rgba(255,95,168,0.85)' : 'rgba(255,95,168,0.3)';
      cube.style.boxShadow   = scale > 1.3 ? '0 0 30px rgba(255,95,168,0.45)' : 'none';
    });
  },

  startAnimation() {
    let lastTime = performance.now();
    const animate = (now) => {
      const dt = Math.min(now - lastTime, 100);
      lastTime = now;

      const wheel = document.getElementById('voidWheel');
      if (wheel) {
        STATE.voidScrollPosition += STATE.voidScrollSpeed * (dt / (1000 / 60));
        const stride = CONFIG.VOID_CUBE_WIDTH + CONFIG.VOID_GAP_WIDTH;

        while (STATE.voidScrollPosition >= stride) {
          const first = document.querySelector('.void-cube');
          if (!first) break;
          wheel.appendChild(first);
          STATE.voidScrollPosition -= stride;
          if (!STATE.voidIsSpinning) this.renderCube(first, this.selectPreviewPrize());
        }

        wheel.style.transform = `translateX(-${STATE.voidScrollPosition}px)`;
        this.updateScales(Array.from(document.querySelectorAll('.void-cube')));
      }
      STATE.voidAnimationFrameId = requestAnimationFrame(animate);
    };
    STATE.voidAnimationFrameId = requestAnimationFrame(animate);
  },

  async spin() {
    if (STATE.voidIsSpinning) return;

    const btn = document.getElementById('voidSpinButton');
    const total = MultiSpin.total('void');

    // Quick local check so a broke player gets instant feedback; the server re-checks everything.
    if (STATE.userStars < total) {
      GameAPI.handleError({ code: 'INSUFFICIENT_STARS', data: { need: total } }, { btn, need: total });
      return;
    }

    STATE.voidIsSpinning = true;
    if (btn) btn.disabled = true;

    // The SERVER takes the Stars, rolls the prizes and grants them. We only animate what it returns.
    const _mult = MultiSpin.get('void');
    STATE.voidMultResults = null;
    let res;
    try {
      res = await GameAPI.spin('void', _mult);
    } catch (e) {
      STATE.voidIsSpinning = false;
      if (btn) btn.disabled = false;
      GameAPI.handleError(e, { btn, need: total });
      return;
    }
    GameAPI.applyBalance(res.after_spend, false);        // Stars leave the balance now ...
    GameAPI.pending = { balance: res.balance };          // ... winnings show when the reel stops
    const _list = res.results.map(r => GameAPI.toPrize('void', r));
    let winning;
    if (_mult > 1) {
      STATE.voidMultResults = _list;
      winning = MultiSpin.best(_list);
    } else {
      winning = _list[0];
    }
    const cubes   = Array.from(document.querySelectorAll('.void-cube'));
    if (!cubes.length) { STATE.voidIsSpinning = false; if (btn) btn.disabled = false; return; }

    cubes.forEach(c => { this._cleanupLottie(c); this.renderCube(c, this.selectPrize()); });

    const stride  = CONFIG.VOID_CUBE_WIDTH + CONFIG.VOID_GAP_WIDTH;
    const minDist = 5000 + Math.random() * 600;
    const winIdx  = Math.floor(minDist / stride) % cubes.length;
    this.renderCube(cubes[winIdx], winning);

    const startTime = Date.now();
    const tick = () => {
      if (!STATE.voidIsSpinning) return;
      const progress = Math.min((Date.now() - startTime) / CONFIG.VOID_SPIN_DURATION, 1);
      STATE.voidScrollSpeed = CONFIG.VOID_SPIN_MAX_SPEED * (1 - (1 - Math.pow(1 - progress, 4)));
      if (progress < 1) { requestAnimationFrame(tick); }
      else { STATE.voidScrollSpeed = 0; setTimeout(() => this.snapToCenter(), 100); }
    };
    tick();
  },

  snapToCenter() {
    const cubes = Array.from(document.querySelectorAll('.void-cube'));
    const wc    = document.querySelector('.void-wheel-container');
    if (!wc) return;
    const center = wc.offsetWidth / 2;
    const wRect  = wc.getBoundingClientRect();
    let bestCube = null, bestDist = Infinity, snapDelta = 0;

    cubes.forEach(c => {
      const r    = c.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - wRect.left - center);
      if (dist < bestDist) { bestDist = dist; bestCube = c; snapDelta = (r.left + r.width / 2 - wRect.left) - center; }
    });

    const startPos = STATE.voidScrollPosition;
    const startT   = Date.now();
    const snap = () => {
      const p = Math.min((Date.now() - startT) / 400, 1);
      const e = 1 - Math.pow(1 - p, 3);
      STATE.voidScrollPosition = startPos + snapDelta * e;
      if (p < 1) { requestAnimationFrame(snap); return; }
      if (bestCube) {
        bestCube.style.transition = 'all .3s ease';
        bestCube.style.borderColor = '#ff5fa8';
        bestCube.style.boxShadow   = '0 0 40px rgba(255,95,168,.75)';
        setTimeout(() => { if (bestCube) bestCube.style.transition = ''; }, 300);
        const final = VOID_SPIN_PRIZES.find(p => p.id === bestCube.dataset.prizeId);
        if (final) setTimeout(() => (STATE.voidMultResults ? this.showMulti() : this.showWin(final)), 200);
      }
    };
    snap();
  },

  // Results sheet for x10 / x100. Prizes are granted when the player collects.
  showMulti() {
    const list = STATE.voidMultResults || [];
    STATE.voidMultResults = null;
    MultiSpin.present('void', list, () => {
      document.querySelectorAll('.void-cube').forEach(c => this._cleanupLottie(c));
      this.populateCubes();
      STATE.voidScrollSpeed = 1;
      STATE.voidIsSpinning  = false;
      const sb = document.getElementById('voidSpinButton');
      if (sb) sb.disabled = false;
      MultiSpin.refresh('void');
    });
  },

  showWin(prize) {
    STATE.voidCurrentWinningPrize = prize;
    GameAPI.settle([prize]);
    const modal    = document.getElementById('voidWinModal');
    const iconEl   = document.getElementById('voidModalPrizeIcon');
    const nameEl   = document.getElementById('voidModalPrizeName');
    const valueRow = document.getElementById('voidModalValueRow');
    if (!modal || !iconEl || !nameEl) return;

    iconEl.innerHTML = '';

    if (prize.type === 'coin') {
      const img = Object.assign(document.createElement('img'), { src: 'assets/Coin.svg', alt: 'Coins' });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;animation:prizeFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 12px 32px rgba(255,95,168,.4))';
      iconEl.appendChild(img);
      nameEl.innerHTML = `<span class="hl">${prize.value}</span> ${Utils.t('coinsWord')}`;
      if (valueRow) {
        valueRow.innerHTML = `<img src="assets/Coin.svg" alt="Coins" style="width:22px;height:22px"><span>${prize.value} ${Utils.t('coinsWord')}</span>`;
        valueRow.style.display = 'flex';
      }
    } else if (prize.type === 'stars') {
      const img = Object.assign(document.createElement('img'), { src: 'assets/TStars.svg', alt: 'Stars' });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;animation:prizeFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 12px 32px rgba(255,95,168,.4))';
      iconEl.appendChild(img);
      nameEl.innerHTML = `<span class="hl">${prize.value}</span> ${Utils.t('starsWord')}`;
      if (valueRow) {
        valueRow.innerHTML = `<img src="assets/TStars.svg" alt="Stars" style="width:22px;height:22px"><span>${prize.value} ${Utils.t('starsAddedToBalance')}</span>`;
        valueRow.style.display = 'flex';
      }
    } else {
      const img = document.createElement('img');
      img.src = GIFT_SVG_ICONS[prize.value] ?? '';
      img.alt = prize.value;
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;animation:prizeFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 12px 32px rgba(255,95,168,.4))';
      iconEl.appendChild(img);
      nameEl.innerHTML = `the <span class="hl">${prize.value}</span>`;
      if (valueRow) {
        const val = PRIZE_COIN_VALUES[prize.value] ?? 50;
        valueRow.innerHTML = `<img src="assets/Coin.svg" alt="Coins" style="width:22px;height:22px"><span>${val.toLocaleString()} ${Utils.t('coinsValue')}</span>`;
        valueRow.style.display = 'flex';
      }
    }

    modal.classList.add('show');
  },

  hideWin() {
    const modal = document.getElementById('voidWinModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => {
      const el = document.getElementById('voidModalPrizeIcon');
      if (el) el.innerHTML = '';
    }, 300);
  },

  async claimWin() {
    if (!STATE.voidCurrentWinningPrize) return;
    const prize = STATE.voidCurrentWinningPrize;
    STATE.voidCurrentWinningPrize = null;

    const claimBtn = document.getElementById('voidClaimButton');
    if (claimBtn) claimBtn.disabled = true;

    // Already granted by the server when the reel stopped — Claim just closes the card.

    this.hideWin();

    document.querySelectorAll('.void-cube').forEach(c => this._cleanupLottie(c));
    this.populateCubes();
    STATE.voidScrollSpeed = 1;
    STATE.voidIsSpinning  = false;
    if (claimBtn) claimBtn.disabled = false;
    const spinBtn = document.getElementById('voidSpinButton');
    if (spinBtn) spinBtn.disabled = false;
  },

  loadIcons() {
    ['voidStars5','voidStars10','voidStars25','voidStars50','voidStars100'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const img = Object.assign(document.createElement('img'), { src: 'assets/TStars.svg', alt: 'Stars' });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain';
      el.appendChild(img);
    });

    [
      ['voidGiftHeart','Heart'], ['voidGiftBear','Bear'],
      ['voidGiftCake','Cake'],   ['voidGiftRocket','Rocket'],
      ['voidGiftRamen','Instant Ramen'], ['voidGiftSocks','Socks'],
      ['voidGiftLollipop','Lollipop']
    ].forEach(([id, giftName]) => {
      const el = document.getElementById(id);
      if (el) {
        const img = Object.assign(document.createElement('img'), {
          src: GIFT_SVG_ICONS[giftName] ?? '',
          alt: giftName
        });
        img.style.cssText = 'width:100%;height:100%;object-fit:contain';
        el.appendChild(img);
      }
    });
  }
};



// ============================================
// MULTI SPIN  (x1 / x10 / x100 on the Void and Furry wheels)
// ============================================
// A multiplier of N means N independent spins in ONE tap, paid up front at
// N x the case price. Every spin uses the exact same odds as a normal spin,
// so the maths stays fair: the chance of getting a prize at least once is
// 1 - (1 - p)^N, and the expected payout is exactly N x a single spin's.
// The reel lands on the best prize of the batch, then a results sheet lists
// everything and grants it on "Collect".
// ============================================
const MultiSpin = {
  OPTIONS: [10, 1, 100],            // on-screen order: 10x | 1x | 100x
  mult: { void: 1, furry: 1, hex: 1, astral: 1 },
  // Optional bulk discount per multiplier (0 = none). e.g. { 10: 0.05 } = x10 costs 5% less.
  DISCOUNT: { 1: 0, 10: 0, 100: 0 },

  table(w)  { return { void: VOID_SPIN_PRIZES, furry: FURRY_SPIN_PRIZES, hex: HEX_SPIN_PRIZES, astral: ASTRAL_SPIN_PRIZES }[w]; },
  price(w)  { return CONFIG[`${w.toUpperCase()}_SPIN_COST`]; },
  get(w)    { return this.mult[w] || 1; },
  total(w, m = this.get(w)) { return Math.round(this.price(w) * m * (1 - (this.DISCOUNT[m] || 0))); },

  // Higher = better. NFTs > other gifts > Stars > coins.
  rank(p) {
    if (p.type === 'gift') return (NFT_GIFTS.includes(p.value) ? 1e6 : 1e3) + (PRIZE_COIN_VALUES[p.value] || 0);
    if (p.type === 'stars') return Number(p.value) || 0;
    return (Number(p.value) || 0) / 100;
  },
  best(list) { return list.reduce((b, p) => (this.rank(p) > this.rank(b) ? p : b), list[0]); },

  // Chance (0-1) of at least one NFT / gift in N spins.
  chance(w, m, kind) {
    const c = GameAPI.cfg?.wheels?.[w];          // honest per-spin odds, published by the server
    const p = c ? (kind === 'nft' ? c.nftChance : c.giftChance) : 0;
    return 1 - Math.pow(1 - p, m);
  },
  fmtPct(x) {
    const v = x * 100;
    return v >= 99.95 ? '99.9+' : v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v.toFixed(2);
  },

  init() {
    ['void', 'furry', 'hex', 'astral'].forEach(w => {
      const btn = document.getElementById(`${w}SpinButton`);
      if (!btn || document.getElementById(`${w}MultRow`)) return;
      const wrap = document.createElement('div');
      wrap.className = 'mult-wrap';
      wrap.innerHTML =
        `<div class="mult-row" id="${w}MultRow" role="group" aria-label="Spin multiplier">` +
        this.OPTIONS.map(m => `<button type="button" class="mult-btn${m === 1 ? ' active' : ''}" data-mult="${m}">${m}x</button>`).join('') +
        `</div><div class="mult-info" id="${w}MultInfo"></div>`;
      btn.parentNode.insertBefore(wrap, btn);
      wrap.querySelectorAll('.mult-btn').forEach(b => b.addEventListener('click', () => this.set(w, Number(b.dataset.mult))));
      this.refresh(w);
    });
  },

  set(w, m) {
    if (STATE[`${w}IsSpinning`]) return;
    this.mult[w] = this.OPTIONS.includes(m) ? m : 1;
    this.refresh(w);
  },

  refresh(w) {
    const m = this.get(w);
    document.querySelectorAll(`#${w}MultRow .mult-btn`).forEach(b => b.classList.toggle('active', Number(b.dataset.mult) === m));
    const cost = document.querySelector(`#${w}SpinButton .spin-btn-cost`);
    if (cost) cost.textContent = this.total(w).toLocaleString();
    const info = document.getElementById(`${w}MultInfo`);
    if (info) {
      info.textContent = m === 1 ? '' :
        `${m} ${Utils.t('multiSpinsWord')} · ` + Utils.t('multiChanceNft', { p: this.fmtPct(this.chance(w, m, 'nft')) });
      info.style.display = m === 1 ? 'none' : '';
    }
  },

  // Show the results sheet; grant everything when the player taps Collect.
  present(w, list, onDone) {
    GameAPI.settle(list);                      // balance + inventory were already decided by the server
    const stars = list.filter(p => p.type === 'stars').reduce((a, p) => a + Number(p.value), 0);
    const coins = list.filter(p => p.type === 'coin').reduce((a, p) => a + Number(p.value), 0);
    const gifts = new Map();
    list.filter(p => p.type === 'gift').forEach(p => gifts.set(p.value, (gifts.get(p.value) || 0) + 1));
    const giftRows = [...gifts.entries()].sort((a, b) =>
      (this.rank({ type: 'gift', value: b[0] }) - this.rank({ type: 'gift', value: a[0] })));

    let ov = document.getElementById('multiWinModal');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'multiWinModal';
      ov.className = 'win-modal-overlay';
      document.body.appendChild(ov);
    }
    const esc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const row = (icon, label, n) =>
      `<div class="mw-row"><img src="${icon}" alt=""><span class="mw-name">${esc(label)}</span><span class="mw-count">×${n}</span></div>`;
    ov.innerHTML =
      `<div class="win-modal mw-card">` +
        `<div class="win-modal-eyebrow">${Utils.t('multiResultsTitle', { n: list.length })}</div>` +
        `<div class="mw-list">` +
          giftRows.map(([name, n]) => row(GIFT_SVG_ICONS[name] || '', name, n)).join('') +
          (stars ? `<div class="mw-row mw-stars"><img src="assets/TStars.svg" alt=""><span class="mw-name">${Utils.t('multiTotalStars')}</span><span class="mw-count">+${stars.toLocaleString()}</span></div>` : '') +
          (coins ? `<div class="mw-row"><img src="assets/Coin.svg" alt=""><span class="mw-name">${Utils.t('coinsWord')}</span><span class="mw-count">+${coins.toLocaleString()}</span></div>` : '') +
        `</div>` +
        `<button type="button" class="spin-button mw-collect" id="multiCollectBtn">${Utils.t('multiCollect')}</button>` +
      `</div>`;
    requestAnimationFrame(() => ov.classList.add('show'));

    const btn = document.getElementById('multiCollectBtn');
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      await this.grant(list);
      ov.classList.remove('show');
      onDone && onDone();
    }, { once: true });
  },

  // Everything was granted by the server at spin time; Collect just closes the sheet.
  async grant() {}
};

// ============================================
// EVENTS CAROUSEL
// Swipeable announcement banners above the live-gifts strip. Native
// scroll-snap drives the swipe; this just keeps the dots in sync and lets
// a dot click scroll to that card. Add more cards straight in the HTML
// (.event-card inside #eventsTrack) — nothing here assumes a fixed count.
// ============================================
const EventsCarousel = {
  track: null,
  dotsEl: null,
  cards: [],
  activeIndex: 0,
  scrollRaf: null,

  init() {
    this.track = document.getElementById('eventsTrack');
    this.dotsEl = document.getElementById('eventsDots');
    if (!this.track || !this.dotsEl) return;

    this.cards = Array.from(this.track.querySelectorAll('.event-card'));
    if (this.cards.length < 2) { this.dotsEl.style.display = 'none'; } // one card needs no dots
    this.renderDots();

    this.track.addEventListener('scroll', () => {
      if (this.scrollRaf) return;
      this.scrollRaf = requestAnimationFrame(() => {
        this.scrollRaf = null;
        this.syncActiveFromScroll();
      });
    }, { passive: true });

    window.addEventListener('resize', () => this.goTo(this.activeIndex, false));
  },

  renderDots() {
    this.dotsEl.innerHTML = '';
    this.cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to announcement ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => this.goTo(i, true));
      this.dotsEl.appendChild(dot);
    });
  },

  goTo(index, smooth) {
    const card = this.cards[index];
    if (!card || !this.track) return;
    this.track.scrollTo({ left: card.offsetLeft, behavior: smooth ? 'smooth' : 'auto' });
    this.setActive(index);
  },

  syncActiveFromScroll() {
    if (!this.track || !this.cards.length) return;
    const center = this.track.scrollLeft + this.track.clientWidth / 2;
    let closest = 0, best = Infinity;
    this.cards.forEach((card, i) => {
      const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (d < best) { best = d; closest = i; }
    });
    this.setActive(closest);
  },

  setActive(index) {
    if (index === this.activeIndex && this.dotsEl.children[index]?.classList.contains('active')) return;
    this.activeIndex = index;
    Array.from(this.dotsEl.children).forEach((dot, i) => dot.classList.toggle('active', i === index));
  }
};


const HEX_SPIN_PRIZES = [];   // filled from the game server (GameAPI.loadConfig) — display rows only

const HEX_PREVIEW_PRIZES = [];   // filled from the game server (GameAPI.loadConfig) — display rows only

const ASTRAL_SPIN_PRIZES = [];   // filled from the game server (GameAPI.loadConfig) — display rows only

const ASTRAL_PREVIEW_PRIZES = [];   // filled from the game server (GameAPI.loadConfig) — display rows only

// ============================================
// FURRY SPIN: third wheel, home-page banner.
// Same engine as Void Spin (own ids, own knobs). Prizes are Stars and gifts
// only: NO coin prizes. Socks, Star Notepad, Calendar and Instant Ramen are NFTs.
// `lottie` on a gift only marks it as a gift; there is no animation file for
// Champagne / the NFTs and none is loaded (icons come from
// GIFT_SVG_ICONS). Both tables must total exactly 100: selectPrize() rolls
// 0-100 and falls back to the FIRST entry if the total is short.
// ============================================
// REAL odds. Decides what the player actually wins.
const FURRY_SPIN_PRIZES = [];   // filled from the game server (GameAPI.loadConfig) — display rows only

// DISPLAY-ONLY odds for the idle reel and pre-reveal repaint.
const FURRY_PREVIEW_PRIZES = [];   // filled from the game server (GameAPI.loadConfig) — display rows only

// Furry Spin engine: a straight copy of VoidSpinWheel (same logic), own ids/state/odds.
const FurrySpinWheel = {
  init() {
    this.populateCubes();
    this.startAnimation();
    this.loadIcons();
  },

  selectPrize() {
    const r = Math.random() * 100;
    let cum = 0;
    for (const p of FURRY_SPIN_PRIZES) { cum += p.chance; if (r <= cum) return p; }
    return FURRY_SPIN_PRIZES[0];
  },

  selectPreviewPrize() {
    const r = Math.random() * 100;
    let cum = 0;
    for (const p of FURRY_PREVIEW_PRIZES) { cum += p.chance; if (r <= cum) return p; }
    return FURRY_PREVIEW_PRIZES[0];
  },

  populateCubes() {
    document.querySelectorAll('.furry-cube').forEach(c => this.renderCube(c, this.selectPreviewPrize()));
  },

  renderCube(cube, prize) {
    this._cleanupLottie(cube);
    cube.dataset.prizeId    = prize.id;
    cube.dataset.prizeType  = prize.type;
    cube.dataset.prizeValue = prize.value;
    if (!cube.dataset.cubeId) cube.dataset.cubeId = `furrycube_${Math.random().toString(36).slice(2,11)}`;
    cube.innerHTML = '';
    cube.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;';

    if (prize.type === 'coin' || prize.type === 'stars') {
      const img = Object.assign(document.createElement('img'), {
        src: prize.type === 'coin' ? 'assets/Coin.svg' : 'assets/TStars.svg',
        alt: prize.type === 'coin' ? 'Coin' : 'Stars'
      });
      img.style.cssText = 'width:70px;height:70px;object-fit:contain;margin:auto';
      const txt = document.createElement('div');
      txt.textContent = prize.value;
      txt.style.cssText = 'position:absolute;top:15%;left:25%;transform:translate(-50%,-50%);font-size:1.5rem;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.8);pointer-events:none';
      cube.append(img, txt);
    } else {
      // Gift — flat SVG, no lottie (see file-header note above).
      const wrap = document.createElement('div');
      wrap.style.cssText = 'width:80px;height:80px;margin:auto';
      const img = Object.assign(document.createElement('img'), {
        src: GIFT_SVG_ICONS[prize.value] ?? '',
        alt: prize.value
      });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain';
      wrap.appendChild(img);
      cube.appendChild(wrap);
    }
  },

  // No-op today (gift cubes don't load lottie instances here), kept so
  // the recycle/spin code paths mirror SpinWheel exactly and stay a
  // drop-in copy if Lottie assets get added for these gifts later.
  _cleanupLottie(cube) {
    const id = cube.dataset.cubeId;
    if (id && STATE.furryLottieInstances.has(id)) {
      STATE.furryLottieInstances.get(id).destroy();
      STATE.furryLottieInstances.delete(id);
    }
  },

  updateScales(cubes) {
    const now = Date.now();
    if (now - STATE.furryLastScaleUpdate < 16 && STATE.furryIsSpinning) return;
    STATE.furryLastScaleUpdate = now;
    const wc = document.querySelector('.furry-wheel-container');
    if (!wc) return;
    const center = wc.offsetWidth / 2;
    const wRect  = wc.getBoundingClientRect();
    cubes.forEach(cube => {
      const cRect = cube.getBoundingClientRect();
      const dist  = Math.abs(cRect.left + cRect.width / 2 - wRect.left - center);
      const scale = Math.max(0.6, 1.5 - (dist / center) * 0.9);
      cube.style.transform   = `scale(${scale})`;
      cube.style.zIndex      = scale > 1.3 ? '5' : '1';
      cube.style.borderColor = scale > 1.3 ? 'rgba(201,242,90,0.85)' : 'rgba(201,242,90,0.3)';
      cube.style.boxShadow   = scale > 1.3 ? '0 0 30px rgba(201,242,90,0.45)' : 'none';
    });
  },

  startAnimation() {
    let lastTime = performance.now();
    const animate = (now) => {
      const dt = Math.min(now - lastTime, 100);
      lastTime = now;

      const wheel = document.getElementById('furryWheel');
      if (wheel) {
        STATE.furryScrollPosition += STATE.furryScrollSpeed * (dt / (1000 / 60));
        const stride = CONFIG.FURRY_CUBE_WIDTH + CONFIG.FURRY_GAP_WIDTH;

        while (STATE.furryScrollPosition >= stride) {
          const first = document.querySelector('.furry-cube');
          if (!first) break;
          wheel.appendChild(first);
          STATE.furryScrollPosition -= stride;
          if (!STATE.furryIsSpinning) this.renderCube(first, this.selectPreviewPrize());
        }

        wheel.style.transform = `translateX(-${STATE.furryScrollPosition}px)`;
        this.updateScales(Array.from(document.querySelectorAll('.furry-cube')));
      }
      STATE.furryAnimationFrameId = requestAnimationFrame(animate);
    };
    STATE.furryAnimationFrameId = requestAnimationFrame(animate);
  },

  async spin() {
    if (STATE.furryIsSpinning) return;

    const btn = document.getElementById('furrySpinButton');
    const total = MultiSpin.total('furry');

    // Quick local check so a broke player gets instant feedback; the server re-checks everything.
    if (STATE.userStars < total) {
      GameAPI.handleError({ code: 'INSUFFICIENT_STARS', data: { need: total } }, { btn, need: total });
      return;
    }

    STATE.furryIsSpinning = true;
    if (btn) btn.disabled = true;

    // The SERVER takes the Stars, rolls the prizes and grants them. We only animate what it returns.
    const _mult = MultiSpin.get('furry');
    STATE.furryMultResults = null;
    let res;
    try {
      res = await GameAPI.spin('furry', _mult);
    } catch (e) {
      STATE.furryIsSpinning = false;
      if (btn) btn.disabled = false;
      GameAPI.handleError(e, { btn, need: total });
      return;
    }
    GameAPI.applyBalance(res.after_spend, false);        // Stars leave the balance now ...
    GameAPI.pending = { balance: res.balance };          // ... winnings show when the reel stops
    const _list = res.results.map(r => GameAPI.toPrize('furry', r));
    let winning;
    if (_mult > 1) {
      STATE.furryMultResults = _list;
      winning = MultiSpin.best(_list);
    } else {
      winning = _list[0];
    }
    const cubes   = Array.from(document.querySelectorAll('.furry-cube'));
    if (!cubes.length) { STATE.furryIsSpinning = false; if (btn) btn.disabled = false; return; }

    cubes.forEach(c => { this._cleanupLottie(c); this.renderCube(c, this.selectPrize()); });

    const stride  = CONFIG.FURRY_CUBE_WIDTH + CONFIG.FURRY_GAP_WIDTH;
    const minDist = 5000 + Math.random() * 600;
    const winIdx  = Math.floor(minDist / stride) % cubes.length;
    this.renderCube(cubes[winIdx], winning);

    const startTime = Date.now();
    const tick = () => {
      if (!STATE.furryIsSpinning) return;
      const progress = Math.min((Date.now() - startTime) / CONFIG.FURRY_SPIN_DURATION, 1);
      STATE.furryScrollSpeed = CONFIG.FURRY_SPIN_MAX_SPEED * (1 - (1 - Math.pow(1 - progress, 4)));
      if (progress < 1) { requestAnimationFrame(tick); }
      else { STATE.furryScrollSpeed = 0; setTimeout(() => this.snapToCenter(), 100); }
    };
    tick();
  },

  snapToCenter() {
    const cubes = Array.from(document.querySelectorAll('.furry-cube'));
    const wc    = document.querySelector('.furry-wheel-container');
    if (!wc) return;
    const center = wc.offsetWidth / 2;
    const wRect  = wc.getBoundingClientRect();
    let bestCube = null, bestDist = Infinity, snapDelta = 0;

    cubes.forEach(c => {
      const r    = c.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - wRect.left - center);
      if (dist < bestDist) { bestDist = dist; bestCube = c; snapDelta = (r.left + r.width / 2 - wRect.left) - center; }
    });

    const startPos = STATE.furryScrollPosition;
    const startT   = Date.now();
    const snap = () => {
      const p = Math.min((Date.now() - startT) / 400, 1);
      const e = 1 - Math.pow(1 - p, 3);
      STATE.furryScrollPosition = startPos + snapDelta * e;
      if (p < 1) { requestAnimationFrame(snap); return; }
      if (bestCube) {
        bestCube.style.transition = 'all .3s ease';
        bestCube.style.borderColor = '#c9f25a';
        bestCube.style.boxShadow   = '0 0 40px rgba(201,242,90,.75)';
        setTimeout(() => { if (bestCube) bestCube.style.transition = ''; }, 300);
        const final = FURRY_SPIN_PRIZES.find(p => p.id === bestCube.dataset.prizeId);
        if (final) setTimeout(() => (STATE.furryMultResults ? this.showMulti() : this.showWin(final)), 200);
      }
    };
    snap();
  },

  // Results sheet for x10 / x100. Prizes are granted when the player collects.
  showMulti() {
    const list = STATE.furryMultResults || [];
    STATE.furryMultResults = null;
    MultiSpin.present('furry', list, () => {
      document.querySelectorAll('.furry-cube').forEach(c => this._cleanupLottie(c));
      this.populateCubes();
      STATE.furryScrollSpeed = 1;
      STATE.furryIsSpinning  = false;
      const sb = document.getElementById('furrySpinButton');
      if (sb) sb.disabled = false;
      MultiSpin.refresh('furry');
    });
  },

  showWin(prize) {
    STATE.furryCurrentWinningPrize = prize;
    GameAPI.settle([prize]);
    const modal    = document.getElementById('furryWinModal');
    const iconEl   = document.getElementById('furryModalPrizeIcon');
    const nameEl   = document.getElementById('furryModalPrizeName');
    const valueRow = document.getElementById('furryModalValueRow');
    if (!modal || !iconEl || !nameEl) return;

    iconEl.innerHTML = '';

    if (prize.type === 'coin') {
      const img = Object.assign(document.createElement('img'), { src: 'assets/Coin.svg', alt: 'Coins' });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;animation:prizeFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 12px 32px rgba(201,242,90,.4))';
      iconEl.appendChild(img);
      nameEl.innerHTML = `<span class="hl">${prize.value}</span> ${Utils.t('coinsWord')}`;
      if (valueRow) {
        valueRow.innerHTML = `<img src="assets/Coin.svg" alt="Coins" style="width:22px;height:22px"><span>${prize.value} ${Utils.t('coinsWord')}</span>`;
        valueRow.style.display = 'flex';
      }
    } else if (prize.type === 'stars') {
      const img = Object.assign(document.createElement('img'), { src: 'assets/TStars.svg', alt: 'Stars' });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;animation:prizeFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 12px 32px rgba(201,242,90,.4))';
      iconEl.appendChild(img);
      nameEl.innerHTML = `<span class="hl">${prize.value}</span> ${Utils.t('starsWord')}`;
      if (valueRow) {
        valueRow.innerHTML = `<img src="assets/TStars.svg" alt="Stars" style="width:22px;height:22px"><span>${prize.value} ${Utils.t('starsAddedToBalance')}</span>`;
        valueRow.style.display = 'flex';
      }
    } else {
      const img = document.createElement('img');
      img.src = GIFT_SVG_ICONS[prize.value] ?? '';
      img.alt = prize.value;
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;animation:prizeFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 12px 32px rgba(201,242,90,.4))';
      iconEl.appendChild(img);
      nameEl.innerHTML = `the <span class="hl">${prize.value}</span>`;
      if (valueRow) {
        const val = PRIZE_COIN_VALUES[prize.value] ?? 50;
        valueRow.innerHTML = `<img src="assets/Coin.svg" alt="Coins" style="width:22px;height:22px"><span>${val.toLocaleString()} ${Utils.t('coinsValue')}</span>`;
        valueRow.style.display = 'flex';
      }
    }

    modal.classList.add('show');
  },

  hideWin() {
    const modal = document.getElementById('furryWinModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => {
      const el = document.getElementById('furryModalPrizeIcon');
      if (el) el.innerHTML = '';
    }, 300);
  },

  async claimWin() {
    if (!STATE.furryCurrentWinningPrize) return;
    const prize = STATE.furryCurrentWinningPrize;
    STATE.furryCurrentWinningPrize = null;

    const claimBtn = document.getElementById('furryClaimButton');
    if (claimBtn) claimBtn.disabled = true;

    // Already granted by the server when the reel stopped — Claim just closes the card.

    this.hideWin();

    document.querySelectorAll('.furry-cube').forEach(c => this._cleanupLottie(c));
    this.populateCubes();
    STATE.furryScrollSpeed = 1;
    STATE.furryIsSpinning  = false;
    if (claimBtn) claimBtn.disabled = false;
    const spinBtn = document.getElementById('furrySpinButton');
    if (spinBtn) spinBtn.disabled = false;
  },

  loadIcons() {
    [['furryStars10',10],['furryStars25',25],['furryStars50',50],['furryStars100',100],['furryStars150',150],['furryStars300',300]].forEach(([id]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const img = Object.assign(document.createElement('img'), { src: 'assets/TStars.svg', alt: 'Stars' });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain';
      el.appendChild(img);
    });

    [
      ['furryGiftSocks','Socks'],       ['furryGiftNotepad','Star Notepad'],
      ['furryGiftRamen','Instant Ramen'], ['furryGiftCalendar','Calendar'],
      ['furryGiftChampagne','Champagne'], ['furryGiftTrophy','Trophy'],
      ['furryGiftDiamond','Diamond'],   ['furryGiftCake','Cake'],
      ['furryGiftRose','Rose']
    ].forEach(([id, giftName]) => {
      const el = document.getElementById(id);
      if (el) {
        const img = Object.assign(document.createElement('img'), {
          src: GIFT_SVG_ICONS[giftName] ?? '',
          alt: giftName
        });
        img.style.cssText = 'width:100%;height:100%;object-fit:contain';
        el.appendChild(img);
      }
    });
  }
};

// Hex Spin engine: a straight copy of the Furry engine (same logic), own ids/state/odds.
const HexSpinWheel = {
  init() {
    this.populateCubes();
    this.startAnimation();
    this.loadIcons();
  },

  selectPrize() {
    const r = Math.random() * 100;
    let cum = 0;
    for (const p of HEX_SPIN_PRIZES) { cum += p.chance; if (r <= cum) return p; }
    return HEX_SPIN_PRIZES[0];
  },

  selectPreviewPrize() {
    const r = Math.random() * 100;
    let cum = 0;
    for (const p of HEX_PREVIEW_PRIZES) { cum += p.chance; if (r <= cum) return p; }
    return HEX_PREVIEW_PRIZES[0];
  },

  populateCubes() {
    document.querySelectorAll('.hex-cube').forEach(c => this.renderCube(c, this.selectPreviewPrize()));
  },

  renderCube(cube, prize) {
    this._cleanupLottie(cube);
    cube.dataset.prizeId    = prize.id;
    cube.dataset.prizeType  = prize.type;
    cube.dataset.prizeValue = prize.value;
    if (!cube.dataset.cubeId) cube.dataset.cubeId = `hexcube_${Math.random().toString(36).slice(2,11)}`;
    cube.innerHTML = '';
    cube.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;';

    if (prize.type === 'coin' || prize.type === 'stars') {
      const img = Object.assign(document.createElement('img'), {
        src: prize.type === 'coin' ? 'assets/Coin.svg' : 'assets/TStars.svg',
        alt: prize.type === 'coin' ? 'Coin' : 'Stars'
      });
      img.style.cssText = 'width:70px;height:70px;object-fit:contain;margin:auto';
      const txt = document.createElement('div');
      txt.textContent = prize.value;
      txt.style.cssText = 'position:absolute;top:15%;left:25%;transform:translate(-50%,-50%);font-size:1.5rem;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.8);pointer-events:none';
      cube.append(img, txt);
    } else {
      // Gift — flat SVG, no lottie (see file-header note above).
      const wrap = document.createElement('div');
      wrap.style.cssText = 'width:80px;height:80px;margin:auto';
      const img = Object.assign(document.createElement('img'), {
        src: GIFT_SVG_ICONS[prize.value] ?? '',
        alt: prize.value
      });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain';
      wrap.appendChild(img);
      cube.appendChild(wrap);
    }
  },

  // No-op today (gift cubes don't load lottie instances here), kept so
  // the recycle/spin code paths mirror SpinWheel exactly and stay a
  // drop-in copy if Lottie assets get added for these gifts later.
  _cleanupLottie(cube) {
    const id = cube.dataset.cubeId;
    if (id && STATE.hexLottieInstances.has(id)) {
      STATE.hexLottieInstances.get(id).destroy();
      STATE.hexLottieInstances.delete(id);
    }
  },

  updateScales(cubes) {
    const now = Date.now();
    if (now - STATE.hexLastScaleUpdate < 16 && STATE.hexIsSpinning) return;
    STATE.hexLastScaleUpdate = now;
    const wc = document.querySelector('.hex-wheel-container');
    if (!wc) return;
    const center = wc.offsetWidth / 2;
    const wRect  = wc.getBoundingClientRect();
    cubes.forEach(cube => {
      const cRect = cube.getBoundingClientRect();
      const dist  = Math.abs(cRect.left + cRect.width / 2 - wRect.left - center);
      const scale = Math.max(0.6, 1.5 - (dist / center) * 0.9);
      cube.style.transform   = `scale(${scale})`;
      cube.style.zIndex      = scale > 1.3 ? '5' : '1';
      cube.style.borderColor = scale > 1.3 ? 'rgba(201,242,90,0.85)' : 'rgba(201,242,90,0.3)';
      cube.style.boxShadow   = scale > 1.3 ? '0 0 30px rgba(201,242,90,0.45)' : 'none';
    });
  },

  startAnimation() {
    let lastTime = performance.now();
    const animate = (now) => {
      const dt = Math.min(now - lastTime, 100);
      lastTime = now;

      const wheel = document.getElementById('hexWheel');
      if (wheel) {
        STATE.hexScrollPosition += STATE.hexScrollSpeed * (dt / (1000 / 60));
        const stride = CONFIG.HEX_CUBE_WIDTH + CONFIG.HEX_GAP_WIDTH;

        while (STATE.hexScrollPosition >= stride) {
          const first = document.querySelector('.hex-cube');
          if (!first) break;
          wheel.appendChild(first);
          STATE.hexScrollPosition -= stride;
          if (!STATE.hexIsSpinning) this.renderCube(first, this.selectPreviewPrize());
        }

        wheel.style.transform = `translateX(-${STATE.hexScrollPosition}px)`;
        this.updateScales(Array.from(document.querySelectorAll('.hex-cube')));
      }
      STATE.hexAnimationFrameId = requestAnimationFrame(animate);
    };
    STATE.hexAnimationFrameId = requestAnimationFrame(animate);
  },

  async spin() {
    if (STATE.hexIsSpinning) return;

    const btn = document.getElementById('hexSpinButton');
    const total = MultiSpin.total('hex');

    // Quick local check so a broke player gets instant feedback; the server re-checks everything.
    if (STATE.userStars < total) {
      GameAPI.handleError({ code: 'INSUFFICIENT_STARS', data: { need: total } }, { btn, need: total });
      return;
    }

    STATE.hexIsSpinning = true;
    if (btn) btn.disabled = true;

    // The SERVER takes the Stars, rolls the prizes and grants them. We only animate what it returns.
    const _mult = MultiSpin.get('hex');
    STATE.hexMultResults = null;
    let res;
    try {
      res = await GameAPI.spin('hex', _mult);
    } catch (e) {
      STATE.hexIsSpinning = false;
      if (btn) btn.disabled = false;
      GameAPI.handleError(e, { btn, need: total });
      return;
    }
    GameAPI.applyBalance(res.after_spend, false);        // Stars leave the balance now ...
    GameAPI.pending = { balance: res.balance };          // ... winnings show when the reel stops
    const _list = res.results.map(r => GameAPI.toPrize('hex', r));
    let winning;
    if (_mult > 1) {
      STATE.hexMultResults = _list;
      winning = MultiSpin.best(_list);
    } else {
      winning = _list[0];
    }
    const cubes   = Array.from(document.querySelectorAll('.hex-cube'));
    if (!cubes.length) { STATE.hexIsSpinning = false; if (btn) btn.disabled = false; return; }

    cubes.forEach(c => { this._cleanupLottie(c); this.renderCube(c, this.selectPrize()); });

    const stride  = CONFIG.HEX_CUBE_WIDTH + CONFIG.HEX_GAP_WIDTH;
    const minDist = 5000 + Math.random() * 600;
    const winIdx  = Math.floor(minDist / stride) % cubes.length;
    this.renderCube(cubes[winIdx], winning);

    const startTime = Date.now();
    const tick = () => {
      if (!STATE.hexIsSpinning) return;
      const progress = Math.min((Date.now() - startTime) / CONFIG.HEX_SPIN_DURATION, 1);
      STATE.hexScrollSpeed = CONFIG.HEX_SPIN_MAX_SPEED * (1 - (1 - Math.pow(1 - progress, 4)));
      if (progress < 1) { requestAnimationFrame(tick); }
      else { STATE.hexScrollSpeed = 0; setTimeout(() => this.snapToCenter(), 100); }
    };
    tick();
  },

  snapToCenter() {
    const cubes = Array.from(document.querySelectorAll('.hex-cube'));
    const wc    = document.querySelector('.hex-wheel-container');
    if (!wc) return;
    const center = wc.offsetWidth / 2;
    const wRect  = wc.getBoundingClientRect();
    let bestCube = null, bestDist = Infinity, snapDelta = 0;

    cubes.forEach(c => {
      const r    = c.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - wRect.left - center);
      if (dist < bestDist) { bestDist = dist; bestCube = c; snapDelta = (r.left + r.width / 2 - wRect.left) - center; }
    });

    const startPos = STATE.hexScrollPosition;
    const startT   = Date.now();
    const snap = () => {
      const p = Math.min((Date.now() - startT) / 400, 1);
      const e = 1 - Math.pow(1 - p, 3);
      STATE.hexScrollPosition = startPos + snapDelta * e;
      if (p < 1) { requestAnimationFrame(snap); return; }
      if (bestCube) {
        bestCube.style.transition = 'all .3s ease';
        bestCube.style.borderColor = '#c9f25a';
        bestCube.style.boxShadow   = '0 0 40px rgba(201,242,90,.75)';
        setTimeout(() => { if (bestCube) bestCube.style.transition = ''; }, 300);
        const final = HEX_SPIN_PRIZES.find(p => p.id === bestCube.dataset.prizeId);
        if (final) setTimeout(() => (STATE.hexMultResults ? this.showMulti() : this.showWin(final)), 200);
      }
    };
    snap();
  },

  // Results sheet for x10 / x100. Prizes are granted when the player collects.
  showMulti() {
    const list = STATE.hexMultResults || [];
    STATE.hexMultResults = null;
    MultiSpin.present('hex', list, () => {
      document.querySelectorAll('.hex-cube').forEach(c => this._cleanupLottie(c));
      this.populateCubes();
      STATE.hexScrollSpeed = 1;
      STATE.hexIsSpinning  = false;
      const sb = document.getElementById('hexSpinButton');
      if (sb) sb.disabled = false;
      MultiSpin.refresh('hex');
    });
  },

  showWin(prize) {
    STATE.hexCurrentWinningPrize = prize;
    GameAPI.settle([prize]);
    const modal    = document.getElementById('hexWinModal');
    const iconEl   = document.getElementById('hexModalPrizeIcon');
    const nameEl   = document.getElementById('hexModalPrizeName');
    const valueRow = document.getElementById('hexModalValueRow');
    if (!modal || !iconEl || !nameEl) return;

    iconEl.innerHTML = '';

    if (prize.type === 'coin') {
      const img = Object.assign(document.createElement('img'), { src: 'assets/Coin.svg', alt: 'Coins' });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;animation:prizeFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 12px 32px rgba(201,242,90,.4))';
      iconEl.appendChild(img);
      nameEl.innerHTML = `<span class="hl">${prize.value}</span> ${Utils.t('coinsWord')}`;
      if (valueRow) {
        valueRow.innerHTML = `<img src="assets/Coin.svg" alt="Coins" style="width:22px;height:22px"><span>${prize.value} ${Utils.t('coinsWord')}</span>`;
        valueRow.style.display = 'flex';
      }
    } else if (prize.type === 'stars') {
      const img = Object.assign(document.createElement('img'), { src: 'assets/TStars.svg', alt: 'Stars' });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;animation:prizeFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 12px 32px rgba(201,242,90,.4))';
      iconEl.appendChild(img);
      nameEl.innerHTML = `<span class="hl">${prize.value}</span> ${Utils.t('starsWord')}`;
      if (valueRow) {
        valueRow.innerHTML = `<img src="assets/TStars.svg" alt="Stars" style="width:22px;height:22px"><span>${prize.value} ${Utils.t('starsAddedToBalance')}</span>`;
        valueRow.style.display = 'flex';
      }
    } else {
      const img = document.createElement('img');
      img.src = GIFT_SVG_ICONS[prize.value] ?? '';
      img.alt = prize.value;
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;animation:prizeFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 12px 32px rgba(201,242,90,.4))';
      iconEl.appendChild(img);
      nameEl.innerHTML = `the <span class="hl">${prize.value}</span>`;
      if (valueRow) {
        const val = PRIZE_COIN_VALUES[prize.value] ?? 50;
        valueRow.innerHTML = `<img src="assets/Coin.svg" alt="Coins" style="width:22px;height:22px"><span>${val.toLocaleString()} ${Utils.t('coinsValue')}</span>`;
        valueRow.style.display = 'flex';
      }
    }

    modal.classList.add('show');
  },

  hideWin() {
    const modal = document.getElementById('hexWinModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => {
      const el = document.getElementById('hexModalPrizeIcon');
      if (el) el.innerHTML = '';
    }, 300);
  },

  async claimWin() {
    if (!STATE.hexCurrentWinningPrize) return;
    const prize = STATE.hexCurrentWinningPrize;
    STATE.hexCurrentWinningPrize = null;

    const claimBtn = document.getElementById('hexClaimButton');
    if (claimBtn) claimBtn.disabled = true;

    // Already granted by the server when the reel stopped — Claim just closes the card.

    this.hideWin();

    document.querySelectorAll('.hex-cube').forEach(c => this._cleanupLottie(c));
    this.populateCubes();
    STATE.hexScrollSpeed = 1;
    STATE.hexIsSpinning  = false;
    if (claimBtn) claimBtn.disabled = false;
    const spinBtn = document.getElementById('hexSpinButton');
    if (spinBtn) spinBtn.disabled = false;
  },

  loadIcons() {
    [['hexStars25',25],['hexStars50',50],['hexStars100',100],['hexStars250',250],['hexStars500',500],['hexStars1000',1000]].forEach(([id]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const img = Object.assign(document.createElement('img'), { src: 'assets/TStars.svg', alt: 'Stars' });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain';
      el.appendChild(img);
    });

    [
      ['hexGiftKissedFrog','Kissed Frog'],
      ['hexGiftVoodooDoll','Voodoo Doll'],
      ['hexGiftVintageCigar','Vintage Cigar'],
      ['hexGiftWitchHat','Witch Hat'],
      ['hexGiftLightSword','Light Sword'],
      ['hexGiftChampagne','Champagne'],
      ['hexGiftRing','Ring'],
      ['hexGiftTrophy','Trophy'],
      ['hexGiftDiamond','Diamond']
    ].forEach(([id, giftName]) => {
      const el = document.getElementById(id);
      if (el) {
        const img = Object.assign(document.createElement('img'), {
          src: GIFT_SVG_ICONS[giftName] ?? '',
          alt: giftName
        });
        img.style.cssText = 'width:100%;height:100%;object-fit:contain';
        el.appendChild(img);
      }
    });
  }
};

// Astral Spin engine: a straight copy of VoidSpinWheel (same logic), own ids/state/odds.
const AstralSpinWheel = {
  init() {
    this.populateCubes();
    this.startAnimation();
    this.loadIcons();
  },

  selectPrize() {
    const r = Math.random() * 100;
    let cum = 0;
    for (const p of ASTRAL_SPIN_PRIZES) { cum += p.chance; if (r <= cum) return p; }
    return ASTRAL_SPIN_PRIZES[0];
  },

  selectPreviewPrize() {
    const r = Math.random() * 100;
    let cum = 0;
    for (const p of ASTRAL_PREVIEW_PRIZES) { cum += p.chance; if (r <= cum) return p; }
    return ASTRAL_PREVIEW_PRIZES[0];
  },

  populateCubes() {
    document.querySelectorAll('.astral-cube').forEach(c => this.renderCube(c, this.selectPreviewPrize()));
  },

  renderCube(cube, prize) {
    this._cleanupLottie(cube);
    cube.dataset.prizeId    = prize.id;
    cube.dataset.prizeType  = prize.type;
    cube.dataset.prizeValue = prize.value;
    if (!cube.dataset.cubeId) cube.dataset.cubeId = `astralcube_${Math.random().toString(36).slice(2,11)}`;
    cube.innerHTML = '';
    cube.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;';

    if (prize.type === 'coin' || prize.type === 'stars') {
      const img = Object.assign(document.createElement('img'), {
        src: prize.type === 'coin' ? 'assets/Coin.svg' : 'assets/TStars.svg',
        alt: prize.type === 'coin' ? 'Coin' : 'Stars'
      });
      img.style.cssText = 'width:70px;height:70px;object-fit:contain;margin:auto';
      const txt = document.createElement('div');
      txt.textContent = prize.value;
      txt.style.cssText = 'position:absolute;top:15%;left:25%;transform:translate(-50%,-50%);font-size:1.5rem;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.8);pointer-events:none';
      cube.append(img, txt);
    } else {
      // Gift — flat SVG, no lottie (see file-header note above).
      const wrap = document.createElement('div');
      wrap.style.cssText = 'width:80px;height:80px;margin:auto';
      const img = Object.assign(document.createElement('img'), {
        src: GIFT_SVG_ICONS[prize.value] ?? '',
        alt: prize.value
      });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain';
      wrap.appendChild(img);
      cube.appendChild(wrap);
    }
  },

  // No-op today (gift cubes don't load lottie instances here), kept so
  // the recycle/spin code paths mirror SpinWheel exactly and stay a
  // drop-in copy if Lottie assets get added for these gifts later.
  _cleanupLottie(cube) {
    const id = cube.dataset.cubeId;
    if (id && STATE.astralLottieInstances.has(id)) {
      STATE.astralLottieInstances.get(id).destroy();
      STATE.astralLottieInstances.delete(id);
    }
  },

  updateScales(cubes) {
    const now = Date.now();
    if (now - STATE.astralLastScaleUpdate < 16 && STATE.astralIsSpinning) return;
    STATE.astralLastScaleUpdate = now;
    const wc = document.querySelector('.astral-wheel-container');
    if (!wc) return;
    const center = wc.offsetWidth / 2;
    const wRect  = wc.getBoundingClientRect();
    cubes.forEach(cube => {
      const cRect = cube.getBoundingClientRect();
      const dist  = Math.abs(cRect.left + cRect.width / 2 - wRect.left - center);
      const scale = Math.max(0.6, 1.5 - (dist / center) * 0.9);
      cube.style.transform   = `scale(${scale})`;
      cube.style.zIndex      = scale > 1.3 ? '5' : '1';
      cube.style.borderColor = scale > 1.3 ? 'rgba(201,242,90,0.85)' : 'rgba(201,242,90,0.3)';
      cube.style.boxShadow   = scale > 1.3 ? '0 0 30px rgba(201,242,90,0.45)' : 'none';
    });
  },

  startAnimation() {
    let lastTime = performance.now();
    const animate = (now) => {
      const dt = Math.min(now - lastTime, 100);
      lastTime = now;

      const wheel = document.getElementById('astralWheel');
      if (wheel) {
        STATE.astralScrollPosition += STATE.astralScrollSpeed * (dt / (1000 / 60));
        const stride = CONFIG.ASTRAL_CUBE_WIDTH + CONFIG.ASTRAL_GAP_WIDTH;

        while (STATE.astralScrollPosition >= stride) {
          const first = document.querySelector('.astral-cube');
          if (!first) break;
          wheel.appendChild(first);
          STATE.astralScrollPosition -= stride;
          if (!STATE.astralIsSpinning) this.renderCube(first, this.selectPreviewPrize());
        }

        wheel.style.transform = `translateX(-${STATE.astralScrollPosition}px)`;
        this.updateScales(Array.from(document.querySelectorAll('.astral-cube')));
      }
      STATE.astralAnimationFrameId = requestAnimationFrame(animate);
    };
    STATE.astralAnimationFrameId = requestAnimationFrame(animate);
  },

  async spin() {
    if (STATE.astralIsSpinning) return;

    const btn = document.getElementById('astralSpinButton');
    const total = MultiSpin.total('astral');

    // Quick local check so a broke player gets instant feedback; the server re-checks everything.
    if (STATE.userStars < total) {
      GameAPI.handleError({ code: 'INSUFFICIENT_STARS', data: { need: total } }, { btn, need: total });
      return;
    }

    STATE.astralIsSpinning = true;
    if (btn) btn.disabled = true;

    // The SERVER takes the Stars, rolls the prizes and grants them. We only animate what it returns.
    const _mult = MultiSpin.get('astral');
    STATE.astralMultResults = null;
    let res;
    try {
      res = await GameAPI.spin('astral', _mult);
    } catch (e) {
      STATE.astralIsSpinning = false;
      if (btn) btn.disabled = false;
      GameAPI.handleError(e, { btn, need: total });
      return;
    }
    GameAPI.applyBalance(res.after_spend, false);        // Stars leave the balance now ...
    GameAPI.pending = { balance: res.balance };          // ... winnings show when the reel stops
    const _list = res.results.map(r => GameAPI.toPrize('astral', r));
    let winning;
    if (_mult > 1) {
      STATE.astralMultResults = _list;
      winning = MultiSpin.best(_list);
    } else {
      winning = _list[0];
    }
    const cubes   = Array.from(document.querySelectorAll('.astral-cube'));
    if (!cubes.length) { STATE.astralIsSpinning = false; if (btn) btn.disabled = false; return; }

    cubes.forEach(c => { this._cleanupLottie(c); this.renderCube(c, this.selectPrize()); });

    const stride  = CONFIG.ASTRAL_CUBE_WIDTH + CONFIG.ASTRAL_GAP_WIDTH;
    const minDist = 5000 + Math.random() * 600;
    const winIdx  = Math.floor(minDist / stride) % cubes.length;
    this.renderCube(cubes[winIdx], winning);

    const startTime = Date.now();
    const tick = () => {
      if (!STATE.astralIsSpinning) return;
      const progress = Math.min((Date.now() - startTime) / CONFIG.ASTRAL_SPIN_DURATION, 1);
      STATE.astralScrollSpeed = CONFIG.ASTRAL_SPIN_MAX_SPEED * (1 - (1 - Math.pow(1 - progress, 4)));
      if (progress < 1) { requestAnimationFrame(tick); }
      else { STATE.astralScrollSpeed = 0; setTimeout(() => this.snapToCenter(), 100); }
    };
    tick();
  },

  snapToCenter() {
    const cubes = Array.from(document.querySelectorAll('.astral-cube'));
    const wc    = document.querySelector('.astral-wheel-container');
    if (!wc) return;
    const center = wc.offsetWidth / 2;
    const wRect  = wc.getBoundingClientRect();
    let bestCube = null, bestDist = Infinity, snapDelta = 0;

    cubes.forEach(c => {
      const r    = c.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - wRect.left - center);
      if (dist < bestDist) { bestDist = dist; bestCube = c; snapDelta = (r.left + r.width / 2 - wRect.left) - center; }
    });

    const startPos = STATE.astralScrollPosition;
    const startT   = Date.now();
    const snap = () => {
      const p = Math.min((Date.now() - startT) / 400, 1);
      const e = 1 - Math.pow(1 - p, 3);
      STATE.astralScrollPosition = startPos + snapDelta * e;
      if (p < 1) { requestAnimationFrame(snap); return; }
      if (bestCube) {
        bestCube.style.transition = 'all .3s ease';
        bestCube.style.borderColor = '#c9f25a';
        bestCube.style.boxShadow   = '0 0 40px rgba(201,242,90,.75)';
        setTimeout(() => { if (bestCube) bestCube.style.transition = ''; }, 300);
        const final = ASTRAL_SPIN_PRIZES.find(p => p.id === bestCube.dataset.prizeId);
        if (final) setTimeout(() => (STATE.astralMultResults ? this.showMulti() : this.showWin(final)), 200);
      }
    };
    snap();
  },

  // Results sheet for x10 / x100. Prizes are granted when the player collects.
  showMulti() {
    const list = STATE.astralMultResults || [];
    STATE.astralMultResults = null;
    MultiSpin.present('astral', list, () => {
      document.querySelectorAll('.astral-cube').forEach(c => this._cleanupLottie(c));
      this.populateCubes();
      STATE.astralScrollSpeed = 1;
      STATE.astralIsSpinning  = false;
      const sb = document.getElementById('astralSpinButton');
      if (sb) sb.disabled = false;
      MultiSpin.refresh('astral');
    });
  },

  showWin(prize) {
    STATE.astralCurrentWinningPrize = prize;
    GameAPI.settle([prize]);
    const modal    = document.getElementById('astralWinModal');
    const iconEl   = document.getElementById('astralModalPrizeIcon');
    const nameEl   = document.getElementById('astralModalPrizeName');
    const valueRow = document.getElementById('astralModalValueRow');
    if (!modal || !iconEl || !nameEl) return;

    iconEl.innerHTML = '';

    if (prize.type === 'coin') {
      const img = Object.assign(document.createElement('img'), { src: 'assets/Coin.svg', alt: 'Coins' });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;animation:prizeFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 12px 32px rgba(201,242,90,.4))';
      iconEl.appendChild(img);
      nameEl.innerHTML = `<span class="hl">${prize.value}</span> ${Utils.t('coinsWord')}`;
      if (valueRow) {
        valueRow.innerHTML = `<img src="assets/Coin.svg" alt="Coins" style="width:22px;height:22px"><span>${prize.value} ${Utils.t('coinsWord')}</span>`;
        valueRow.style.display = 'flex';
      }
    } else if (prize.type === 'stars') {
      const img = Object.assign(document.createElement('img'), { src: 'assets/TStars.svg', alt: 'Stars' });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;animation:prizeFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 12px 32px rgba(201,242,90,.4))';
      iconEl.appendChild(img);
      nameEl.innerHTML = `<span class="hl">${prize.value}</span> ${Utils.t('starsWord')}`;
      if (valueRow) {
        valueRow.innerHTML = `<img src="assets/TStars.svg" alt="Stars" style="width:22px;height:22px"><span>${prize.value} ${Utils.t('starsAddedToBalance')}</span>`;
        valueRow.style.display = 'flex';
      }
    } else {
      const img = document.createElement('img');
      img.src = GIFT_SVG_ICONS[prize.value] ?? '';
      img.alt = prize.value;
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;animation:prizeFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 12px 32px rgba(201,242,90,.4))';
      iconEl.appendChild(img);
      nameEl.innerHTML = `the <span class="hl">${prize.value}</span>`;
      if (valueRow) {
        const val = PRIZE_COIN_VALUES[prize.value] ?? 50;
        valueRow.innerHTML = `<img src="assets/Coin.svg" alt="Coins" style="width:22px;height:22px"><span>${val.toLocaleString()} ${Utils.t('coinsValue')}</span>`;
        valueRow.style.display = 'flex';
      }
    }

    modal.classList.add('show');
  },

  hideWin() {
    const modal = document.getElementById('astralWinModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => {
      const el = document.getElementById('astralModalPrizeIcon');
      if (el) el.innerHTML = '';
    }, 300);
  },

  async claimWin() {
    if (!STATE.astralCurrentWinningPrize) return;
    const prize = STATE.astralCurrentWinningPrize;
    STATE.astralCurrentWinningPrize = null;

    const claimBtn = document.getElementById('astralClaimButton');
    if (claimBtn) claimBtn.disabled = true;

    // Already granted by the server when the reel stopped — Claim just closes the card.

    this.hideWin();

    document.querySelectorAll('.astral-cube').forEach(c => this._cleanupLottie(c));
    this.populateCubes();
    STATE.astralScrollSpeed = 1;
    STATE.astralIsSpinning  = false;
    if (claimBtn) claimBtn.disabled = false;
    const spinBtn = document.getElementById('astralSpinButton');
    if (spinBtn) spinBtn.disabled = false;
  },

  loadIcons() {
    [['astralStars50',50],['astralStars100',100],['astralStars250',250],['astralStars500',500],['astralStars1000',1000],['astralStars2500',2500]].forEach(([id]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const img = Object.assign(document.createElement('img'), { src: 'assets/TStars.svg', alt: 'Stars' });
      img.style.cssText = 'width:100%;height:100%;object-fit:contain';
      el.appendChild(img);
    });

    [
      ['astralGiftAstralShard','Astral Shard'],
      ['astralGiftVoodooDoll','Voodoo Doll'],
      ['astralGiftLuckyLocket','Lucky Locket'],
      ['astralGiftInputKey','Input Key'],
      ['astralGiftTrophy','Trophy'],
      ['astralGiftDiamond','Diamond'],
      ['astralGiftRing','Ring']
    ].forEach(([id, giftName]) => {
      const el = document.getElementById(id);
      if (el) {
        const img = Object.assign(document.createElement('img'), {
          src: GIFT_SVG_ICONS[giftName] ?? '',
          alt: giftName
        });
        img.style.cssText = 'width:100%;height:100%;object-fit:contain';
        el.appendChild(img);
      }
    });
  }
};

// ============================================
// SETTINGS
// ============================================

const Settings = {
  load() {
    try {
      const saved = localStorage.getItem('appSettings');
      if (saved) { Object.assign(STATE.settings, JSON.parse(saved)); }
    } catch { /* ignore */ }
    this.apply();
    this.applyEffects();
    this.applyTranslations();
  },

  save() {
    try { localStorage.setItem('appSettings', JSON.stringify(STATE.settings)); } catch { /* ignore */ }
  },

  apply() {
    ['soundEffects','prizeAlerts','animationsEnabled','showInLeaderboard','shareStats'].forEach(id => {
     const el = document.getElementById(id);
     if (el) el.checked = STATE.settings[id];
    });
    const langEl = document.getElementById('currentLanguage');
    if (langEl) langEl.textContent = LANGUAGE_NAMES[STATE.settings.language] ?? 'English';
  },

  applyEffects() {
    const html = document.documentElement;
    const existing = document.getElementById('animation-override');
    if (existing) existing.remove();
    if (!STATE.settings.animationsEnabled) {
      html.classList.add('animations-disabled');
      const style = document.createElement('style');
      style.id = 'animation-override';
      style.textContent = `.animations-disabled *{animation-duration:0s!important;transition-duration:0s!important}`;
      document.head.appendChild(style);
    } else {
      html.classList.remove('animations-disabled');
    }
    window.soundEnabled    = STATE.settings.soundEffects;
  },

  // Applies translations to every static [data-i18n] element AND
  // re-renders the JS-generated bits (leaderboard tabs/labels, deposit
  // package cards, inventory/prize modal state) so switching language
  // updates everything currently on screen, not just the static markup.
  applyTranslations() {
    document.querySelectorAll('[data-i18n-empty]').forEach(el => {
      el.setAttribute('data-empty', Utils.t(el.getAttribute('data-i18n-empty')));
    });
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const txt = Utils.t(key);
      if (el.tagName === 'INPUT' && el.placeholder !== undefined) { el.placeholder = txt; }
      else {
        const icon = el.querySelector('svg,img,.icon');
        if (icon) {
          Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim()).forEach(n => n.textContent = txt);
        } else { el.textContent = txt; }
      }
    });

    Leaderboard.refreshLabels();
    Deposit.refreshLabels();
    if (document.getElementById('fullInventoryModal')?.classList.contains('show')) {
      FullInventoryModal.render(STATE.currentFilter);
    }
  },

  init() {
    this.load();
    ['soundEffects','prizeAlerts','animationsEnabled','showInLeaderboard','shareStats'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        STATE.settings[id] = e.target.checked;
        this.save(); this.applyEffects();
        if (id === 'showInLeaderboard') BackendAPI.syncUserProfile({ show_in_leaderboard: e.target.checked });
        Utils.showToast(Utils.t('settingSaved'));
      });
    });
    document.getElementById('languageSetting')?.addEventListener('click', () => LanguageModal.open());
    document.getElementById('termsBtn')?.addEventListener('click', () => { window.location.href = 'tos.html'; });
    document.getElementById('privacyBtn')?.addEventListener('click', () => { window.location.href = 'privacy.html'; });
    document.getElementById('resetDataBtn')?.addEventListener('click', () => this.resetData());
    document.getElementById('clearCacheBtn')?.addEventListener('click', () => this.clearCache());
    Promocode.init();
  },

  resetData() {
    if (!confirm(Utils.t('confirmResetData'))) return;
    if (prompt(Utils.t('confirmResetType')) !== 'RESET') { alert(Utils.t('resetCancelled')); return; }
    localStorage.clear();
    STATE.userCoins = 0; STATE.userStars = 0; STATE.inventoryItems = [];
    Currency.update(); Inventory.updateDisplay();
    alert(Utils.t('allDataReset'));
    setTimeout(() => window.location.reload(), 1000);
  },

  clearCache() {
    if (confirm(Utils.t('confirmClearCache'))) Utils.showToast(Utils.t('cacheCleared'));
  }
};

// ============================================
// LANGUAGE MODAL
// ============================================

const LanguageModal = {
  open() {
    const modal = document.getElementById('languageModal');
    if (!modal) return;
    this.updateSelection();
    modal.classList.add('show');
  },

  close() { document.getElementById('languageModal')?.classList.remove('show'); },

  updateSelection() {
    document.querySelectorAll('.language-option').forEach(o => {
      o.classList.toggle('active', o.dataset.lang === STATE.settings.language);
    });
  },

  init() {
    document.getElementById('languageModalClose')?.addEventListener('click', () => this.close());
    document.getElementById('languageModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) this.close(); });
    document.querySelectorAll('.language-option').forEach(opt => {
      opt.addEventListener('click', () => {
        STATE.settings.language = opt.dataset.lang;
        Settings.save();
        const langEl = document.getElementById('currentLanguage');
        if (langEl) langEl.textContent = LANGUAGE_NAMES[opt.dataset.lang];
        this.updateSelection();
        Settings.applyTranslations();
        setTimeout(() => { this.close(); Utils.showToast(Utils.t('languageChanged')); }, 300);
      });
    });
  }
};

// ============================================
// SUBSCRIPTION GATE
// ============================================
// Gates both spin buttons behind a "join our Telegram channel" check.
// The actual membership check MUST happen server-side (it needs the bot
// token to call Telegram's getChatMember), so this module just calls
// CONFIG.SUBSCRIPTION_CHECK_URL and expects { subscribed: true|false }
// back. See the bottom of this file / the chat reply for a ready-to-drop
// Node/Express snippet for that endpoint.

const Subscription = {
  pendingAction: null,

  getUserId() {
    const direct = STATE.tg?.initDataUnsafe?.user?.id;
    if (direct) return direct;
    // initDataUnsafe can be empty for a moment on a slow start even though
    // the raw signed initData string is already there — read the id from it.
    try {
      const raw = new URLSearchParams(STATE.tg?.initData || '').get('user');
      return raw ? (JSON.parse(raw).id ?? null) : null;
    } catch {
      return null;
    }
  },

  // Returns { subscribed, error }.
  //   subscribed:true            -> let them spin
  //   subscribed:false,error:false -> the server CONFIRMED they haven't joined
  //   subscribed:false,error:true  -> we couldn't verify (network / server /
  //                                   Telegram hiccup) — NOT the same thing,
  //                                   so the UI says "try again" instead of
  //                                   "you haven't joined".
  // Still fails closed (no spin) when unverifiable, but a flaky moment is
  // retried once automatically before giving up.
  async checkMembership() {
    const userId = this.getUserId();
    if (!userId) return { subscribed: false, error: true };

    const url = `${CONFIG.SUBSCRIPTION_CHECK_URL}?user_id=${encodeURIComponent(userId)}&channel=${encodeURIComponent(CONFIG.SUBSCRIPTION_CHANNEL_USERNAME)}`;

    for (let attempt = 0; attempt < 2; attempt++) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      try {
        const res = await fetch(url, { signal: ctrl.signal });
        if (res.ok) {
          const data = await res.json();
          if (data.subscribed) return { subscribed: true, error: false };
          if (!data.error) return { subscribed: false, error: false }; // confirmed "not joined"
          // data.error set -> the server couldn't verify; fall through and retry
        }
      } catch {
        // network error / timeout — fall through and retry
      } finally {
        clearTimeout(timer);
      }
      if (attempt === 0) await new Promise(r => setTimeout(r, 700));
    }
    return { subscribed: false, error: true };
  },

  openChannel() {
    const link = CONFIG.SUBSCRIPTION_CHANNEL_URL;
    if (STATE.tg?.openTelegramLink) { STATE.tg.openTelegramLink(link); }
    else if (STATE.tg?.openLink) { STATE.tg.openLink(link); }
    else { window.open(link, '_blank'); }
  },

  show() {
    const nameEl = document.getElementById('subscribeChannelName');
    if (nameEl) nameEl.textContent = CONFIG.SUBSCRIPTION_CHANNEL_USERNAME;
    document.getElementById('subscribeModal')?.classList.add('show');
  },

  hide() {
    document.getElementById('subscribeModal')?.classList.remove('show');
  },

  // Called by the spin buttons instead of the spin function directly.
  // Runs `spinFn` immediately once verified for the session; otherwise
  // checks the backend first and opens the popup on a miss.
  async gate(spinFn) {
    if (!CONFIG.SUBSCRIPTION_REQUIRED || STATE.subscriptionVerified) { spinFn(); return; }
    const { subscribed, error } = await this.checkMembership();
    if (subscribed) {
      STATE.subscriptionVerified = true;
      spinFn();
    } else {
      this.pendingAction = spinFn;
      this.show();
      if (error) Utils.showToast(Utils.t('subscribeCheckFailed'), 'error');
    }
  },

  // "OK" button in the popup — re-checks, and on success closes the
  // popup and fires whichever spin was waiting on it.
  async recheck() {
    const btn = document.getElementById('subscribeCheckBtn');
    const originalLabel = btn?.textContent;
    if (btn) { btn.disabled = true; btn.textContent = Utils.t('subscribeChecking'); }

    const { subscribed, error } = await this.checkMembership();

    if (btn) { btn.disabled = false; btn.textContent = originalLabel ?? Utils.t('subscribeCheckBtn'); }

    if (subscribed) {
      STATE.subscriptionVerified = true;
      this.hide();
      const action = this.pendingAction;
      this.pendingAction = null;
      if (action) action();
    } else {
      Utils.showToast(Utils.t(error ? 'subscribeCheckFailed' : 'notSubscribedYet'), 'error');
    }
  },

  init() {
    const nameEl = document.getElementById('subscribeChannelName');
    if (nameEl) nameEl.textContent = CONFIG.SUBSCRIPTION_CHANNEL_USERNAME;

    document.getElementById('subscribeChannelBtn')?.addEventListener('click', () => this.openChannel());
    document.getElementById('subscribeCheckBtn')?.addEventListener('click', () => this.recheck());
    document.getElementById('subscribeModalClose')?.addEventListener('click', () => this.hide());
    document.getElementById('subscribeModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) this.hide(); });
  }
};

// ============================================
// PROMOCODE
// ============================================

const Promocode = {
  init() {
    document.getElementById('promocodeSubmitBtn')?.addEventListener('click', () => this.submit());
    const input = document.getElementById('promocodeInput');
    input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.submit(); });
    input?.addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase(); });
  },

  async submit() {
    const input = document.getElementById('promocodeInput');
    const btn   = document.getElementById('promocodeSubmitBtn');
    const code  = input?.value.trim().toUpperCase() ?? '';
    if (!code) { this.showStatus(Utils.t('promoEnterCode'), 'error'); return; }
    if (btn) btn.disabled = true;
    try {
      const r = await GameAPI.promo(code);       // the server validates, limits and pays out
      GameAPI.applyBalance(r.balance);
      if (r.gifts?.length) await GameAPI.refresh();
      const parts = [];
      if (r.coins) parts.push(`${r.coins.toLocaleString()} ${Utils.t('coinsWord')}`);
      if (r.stars) parts.push(`${r.stars.toLocaleString()} ${Utils.t('starsWord')}`);
      (r.gifts || []).forEach(g => parts.push(g.gift));
      const msgKey = r.message_key && TRANSLATIONS.en[r.message_key] ? r.message_key : 'promoRedeemedShort';
      this.showStatus(`✓ ${Utils.t(msgKey)} +${parts.join(', ')}`, 'success');
      if (input) input.value = '';
    } catch (e) {
      const key = { PROMO_INVALID: 'promoInvalid', PROMO_ALREADY: 'promoAlreadyRedeemed', PROMO_EXPIRED: 'promoExpired', PROMO_USED_UP: 'promoUsedUp',
                    PROMO_PAYMENT_REQUIRED: 'promoPaymentRequired', PROMO_BLOCKED: 'promoBlocked' }[e.code];
      this.showStatus(key ? Utils.t(key, { n: e.data?.required_ton ?? 2 }) : (e.code === 'RATE_LIMITED' ? e.message : Utils.t('serverUnreachable')), 'error');
    } finally {
      if (btn) setTimeout(() => btn.disabled = false, 1500);
    }
  },

  showStatus(message, type) {
    const el = document.getElementById('promocodeStatus');
    if (!el) return;
    el.textContent = message;
    el.className   = `promocode-status show ${type}`;
    setTimeout(() => el.classList.remove('show'), 3500);
  }
};

// ============================================
// CONTENT BOXES
// ============================================

const ContentBoxes = {
  init() {
    document.querySelector('.content-box-left-1')?.addEventListener('click', () => Navigation.navigateTo('dailyspin'));

    // Void Spin — card was never wired to navigate anywhere, which is why
    // clicking it did nothing. Card click + explicit button click both
    // route to the same place; stopPropagation on the button just avoids
    // a redundant double-fire when the click bubbles up to the card.
    document.querySelector('.content-box-void')?.addEventListener('click', () => Navigation.navigateTo('voidspin'));

    document.querySelector('.void-spin-cta')?.addEventListener('click', (e) => {
      e.stopPropagation();
      Navigation.navigateTo('voidspin');
    });

    // Furry Spin: same wiring as Void
    document.querySelector('.content-box-furry')?.addEventListener('click', () => Navigation.navigateTo('furryspin'));
    document.querySelector('.furry-spin-cta')?.addEventListener('click', (e) => {
      e.stopPropagation();
      Navigation.navigateTo('furryspin');
    });

    // Hex Spin: same wiring as Furry
    document.querySelector('.content-box-hex')?.addEventListener('click', () => Navigation.navigateTo('hexspin'));
    document.querySelector('.hex-spin-cta')?.addEventListener('click', (e) => {
      e.stopPropagation();
      Navigation.navigateTo('hexspin');
    });

    // Astral Spin: same wiring as Furry
    document.querySelector('.content-box-astral')?.addEventListener('click', () => Navigation.navigateTo('astralspin'));
    document.querySelector('.astral-spin-cta')?.addEventListener('click', (e) => {
      e.stopPropagation();
      Navigation.navigateTo('astralspin');
    });

    document.querySelector('.content-box-right .card-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      FullInventoryModal.open();
    });

    document.querySelector('.promo-card .card-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      Navigation.navigateTo('settings');
    });

    // Open a t.me link inside Telegram when we're in the mini app, a new tab otherwise.
    const openTg = (url) => {
      if (STATE.tg?.openTelegramLink) STATE.tg.openTelegramLink(url);
      else window.open(url, '_blank', 'noopener');
    };

    // Contact Support row (had no handler before)
    document.querySelector('.tile--contact')?.addEventListener('click', () => openTg(CONFIG.SUPPORT_URL));

    // Every t.me link in the page (channel button, promo card, maintenance screen).
    // Also stops a bare "#" link from firing popstate and bouncing the user to Home.
    document.addEventListener('click', (e) => {
      const a = e.target.closest?.('a[href^="https://t.me/"]');
      if (!a) return;
      e.preventDefault();
      openTg(a.href);
    });
  }
};

// ============================================
// LOTTIE INIT
// ============================================

const LottieAnimations = {
  init() {
    setTimeout(() => {
      const dailyEl = document.getElementById('lottieAnimation');
      if (dailyEl) {
        const anim = lottie.loadAnimation({ container: dailyEl, renderer: 'svg', loop: false, autoplay: false, path: 'assets/DailyGift.json' });
        anim.addEventListener('complete', () => setTimeout(() => anim.goToAndPlay(0, true), 5000));
        setTimeout(() => anim.play(), 1000);
      }
      const invEl = document.getElementById('inventoryLottieAnimation');
      if (invEl) {
        const anim = lottie.loadAnimation({ container: invEl, renderer: 'svg', loop: false, autoplay: false, path: 'assets/CrystalForInv.json' });
        anim.addEventListener('complete', () => setTimeout(() => anim.goToAndPlay(0, true), 5000));
        setTimeout(() => anim.play(), 1000);
      }
    }, 2500);
  }
};

// ============================================
// EVENT LISTENERS
// ============================================

const EventListeners = {
  init() {
    document.getElementById('prizeModalClose')?.addEventListener('click', () => PrizeModal.close());
    document.getElementById('prizeModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) PrizeModal.close(); });
    document.getElementById('convertBtn')?.addEventListener('click', () => PrizeModal.convert());
    document.getElementById('claimPrizeBtn')?.addEventListener('click', () => PrizeModal.claim());

    document.getElementById('spinButton')?.addEventListener('click', async () => {
      await SpinWheel.cooldownReady;              // saved cooldown must be loaded before we decide
      if (SpinWheel.notifyIfCooldown()) return;   // before the subscription gate: no channel popup for a spin that can't happen
      Subscription.gate(() => SpinWheel.spin());
    });
    document.getElementById('claimButton')?.addEventListener('click', () => SpinWheel.claimWin());
    document.getElementById('winModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) SpinWheel.hideWin(); });

    // ── Void Spin ──
    document.getElementById('voidSpinButton')?.addEventListener('click', () => Subscription.gate(() => VoidSpinWheel.spin()));
    document.getElementById('voidClaimButton')?.addEventListener('click', () => VoidSpinWheel.claimWin());
    document.getElementById('voidWinModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) VoidSpinWheel.hideWin(); });

    document.getElementById('furrySpinButton')?.addEventListener('click', () => Subscription.gate(() => FurrySpinWheel.spin()));
    document.getElementById('furryClaimButton')?.addEventListener('click', () => FurrySpinWheel.claimWin());
    document.getElementById('furryWinModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) FurrySpinWheel.hideWin(); });

    document.getElementById('hexSpinButton')?.addEventListener('click', () => Subscription.gate(() => HexSpinWheel.spin()));
    document.getElementById('hexClaimButton')?.addEventListener('click', () => HexSpinWheel.claimWin());
    document.getElementById('hexWinModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) HexSpinWheel.hideWin(); });

    document.getElementById('astralSpinButton')?.addEventListener('click', () => Subscription.gate(() => AstralSpinWheel.spin()));
    document.getElementById('astralClaimButton')?.addEventListener('click', () => AstralSpinWheel.claimWin());
    document.getElementById('astralWinModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) AstralSpinWheel.hideWin(); });

    document.getElementById('fullInventoryClose')?.addEventListener('click', () => FullInventoryModal.close());
    document.getElementById('fullInventoryModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) FullInventoryModal.close(); });

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.currentFilter = btn.dataset.filter;
        FullInventoryModal.render(STATE.currentFilter);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { PrizeModal.close(); FullInventoryModal.close(); LanguageModal.close(); Menu.closeAll(); SpinWheel.hideWin(); VoidSpinWheel.hideWin(); FurrySpinWheel.hideWin(); HexSpinWheel.hideWin(); AstralSpinWheel.hideWin(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); FullInventoryModal.open(); }
    });

    window.addEventListener('beforeunload', () => {
      STATE.lottieInstances.forEach(i => i.destroy());
      STATE.lottieInstances.clear();
      STATE.voidLottieInstances.forEach(i => i.destroy());
      STATE.voidLottieInstances.clear();
      BackendAPI.stopPeriodicSync();
    });
  }
};

// ============================================
// PAYMENT SUCCESS ON LOAD
// ============================================

function checkForPaymentSuccess() {
  const params     = new URLSearchParams(window.location.search);
  const starsToAdd = params.get('stars');
  if (!starsToAdd) return;

  const amount = parseInt(starsToAdd, 10);
  if (isNaN(amount) || amount <= 0) { cleanupURLParams(); return; }

  Utils.showToast(Utils.t('paymentSuccessAdding', { n: amount }), 'success');
  setTimeout(async () => {
    await GameAPI.claimCredits();
    await BackendAPI.syncBalance();
    Utils.showToast(Utils.t('starsAdded', { n: amount }), 'success');
    cleanupURLParams();
  }, 2000);
}

function cleanupURLParams() {
  try { window.history.replaceState({}, document.title, window.location.pathname + window.location.hash); } catch { /* ignore */ }
}

// ============================================
// BOOT
// ============================================

async function initializeApp() {
  const { status, message } = await StatusCheck.fetchStatus();

  if (status === 'maintenance') {
    LoadingScreen.showMaintenance(message);
    return; 
  }

  // The game server owns prices, odds, balances and promocodes — load its public config first.
  let _cfgOk = false;
  for (let i = 0; i < 3 && !_cfgOk; i++) {
    try { await GameAPI.loadConfig(); _cfgOk = true; } catch (e) { console.error('config load failed', e); await new Promise(r => setTimeout(r, 1200)); }
  }
  if (!_cfgOk) { LoadingScreen.showMaintenance(Utils.t('serverUnreachable')); return; }

  checkForPaymentSuccess();
  TelegramApp.init();
  LoadingScreen.init();
  Navigation.init();
  Menu.init();
  BottomNav.init();
  Settings.init();
  LanguageModal.init();
  Subscription.init();
  WalletPickerModal.init();
  TonWalletManage.init();
  TonPurchaseFlow.init();
  ContentBoxes.init();
  EventListeners.init();

  GameAPI._firstRefresh = GameAPI.refresh();
  await GameAPI._firstRefresh;
  Currency.update();
  Inventory.updateDisplay();
  Countdown.init();
  TonWallet.init()

  document.querySelectorAll('[data-cost="furry"]').forEach(el => el.textContent = CONFIG.FURRY_SPIN_COST);
  document.querySelectorAll('[data-cost="hex"]').forEach(el => el.textContent = CONFIG.HEX_SPIN_COST);
  document.querySelectorAll('[data-cost="astral"]').forEach(el => el.textContent = CONFIG.ASTRAL_SPIN_COST);
  document.querySelectorAll('[data-cost="void"]').forEach(el => el.textContent = CONFIG.VOID_SPIN_COST);

  startWheels();
}

// Отдельная функция вместо голого addEventListener('load', ...) —
// проверяет, не наступила ли загрузка страницы УЖЕ (пока мы ждали
// ответ от StatusCheck), и в этом случае запускает колёса сразу,
// вместо того чтобы вечно ждать событие, которое уже никогда не придёт.
function startWheels() {
  const run = () => {
    SpinWheel.init();
    VoidSpinWheel.init();
    FurrySpinWheel.init();
    HexSpinWheel.init();
    AstralSpinWheel.init();
    MultiSpin.init();
    EventsCarousel.init();
    LottieAnimations.init();
  };
  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run, { once: true });
  }
}

// Global API for external use
window.TelegramGame = {
  state: STATE, config: CONFIG,
  Currency, Inventory, Navigation, Settings,
  SpinWheel, VoidSpinWheel, FurrySpinWheel, HexSpinWheel, AstralSpinWheel, EventsCarousel, Leaderboard, Notifications,
  PrizeModal, FullInventoryModal, Deposit, BottomNav
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
