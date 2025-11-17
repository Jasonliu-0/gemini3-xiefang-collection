// 多语言配置文件
export type Locale = 'zh' | 'en'

export const translations = {
  zh: {
    // Header
    'header.title': '撷芳集',
    'header.subtitle': 'Gemini 3.0',
    'header.browse': '浏览作品',
    'header.upload': '上传作品',
    'header.login': '登录',
    
    // Login
    'login.selectMethod': '选择登录方式',
    'login.github': '使用 GitHub 登录',
    'login.linuxdo': '使用 Linux DO 登录',
    'login.githubRecommended': '使用 GitHub 登录 ⭐',
    'login.recommend': '推荐使用 GitHub 登录',
    'login.myAccount': '我的账户',
    'login.logout': '退出登录',
    
    // Home Page
    'home.mainTitle': '撷芳集',
    'home.subtitle1': '撷芳拾翠 · 集珍纳华',
    'home.subtitle2': '汇聚 Gemini 灵感 · 珍藏 AI 佳作',
    'home.subtitle3': '让优秀作品，被更多人看见',
    'home.description': '采撷芬芳如花的优秀作品，拾取翠玉般的精品创作\n汇集成珍贵的作品集，容纳一切华美的 AI 艺术',
    'home.searchPlaceholder': '搜索作品...',
    'home.search': '搜索',
    'home.hotTags': '热门标签',
    'home.clearFilter': '清除筛选',
    'home.currentFilter': '当前筛选：',
    'home.searchColon': '搜索',
    'home.tag': '标签',
    'home.foundWorks': '找到 {count} 个作品',
    
    // Stats
    'stats.totalWorks': '芳华璀璨',
    'stats.totalViews': '观者云集',
    'stats.totalLikes': '倾心之作',
    'stats.sort': '排序：',
    'stats.latest': '时新',
    'stats.views': '观瞻',
    'stats.likes': '倾心',
    'stats.title': '数据统计',
    'stats.tagDistribution': '热门标签分布',
    'stats.monthlyTrend': '月度作品趋势',
    'stats.topWorks': '热门作品 TOP 10',
    
    // Empty States
    'empty.noMatch': '未觅芳踪',
    'empty.noMatchDesc': '暂无匹配的作品，试试其他筛选条件',
    'empty.noWorks': '待君撷芳',
    'empty.noWorksDesc': '此处尚无佳作，期待您的优秀创作\n成为撷芳集的第一缕芬芳',
    'empty.uploadWork': '珍藏作品',
    
    // Footer
    'footer.dataGlimpse': '数据一瞥',
    'footer.dataDesc': '用数字记录每一次灵感的闪光。',
    'footer.worksCount': '作品收录',
    'footer.totalViews': '累计浏览',
    'footer.totalLikes': '获得点赞',
    'footer.slogan': '撷芳拾翠，集珍纳华\n珍藏 Gemini 3.0 创作的优秀作品',
    'footer.joinCreation': '加入创作',
    'footer.joinDesc': '把你的 Gemini 3.0 佳作，也收入这本「撷芳集」。',
    'footer.uploadWork': '上传作品',
    'footer.tags.illustration': '插画灵感',
    'footer.tags.3d': '3D 场景',
    'footer.tags.web': '网页设计',
  },
  en: {
    // Header
    'header.title': 'Xiefang Collection',
    'header.subtitle': 'Gemini 3.0',
    'header.browse': 'Browse',
    'header.upload': 'Upload',
    'header.login': 'Login',
    
    // Login
    'login.selectMethod': 'Select Login Method',
    'login.github': 'Sign in with GitHub',
    'login.linuxdo': 'Sign in with Linux DO',
    'login.githubRecommended': 'Sign in with GitHub ⭐',
    'login.recommend': 'Recommend using GitHub',
    'login.myAccount': 'My Account',
    'login.logout': 'Logout',
    
    // Home Page
    'home.mainTitle': 'Xiefang Collection',
    'home.subtitle1': 'Curate Excellence · Collect Brilliance',
    'home.subtitle2': 'Gather Gemini Inspiration · Treasure AI Masterpieces',
    'home.subtitle3': 'Let Outstanding Works Be Seen by More People',
    'home.description': 'Curate outstanding works like fragrant flowers, collect exquisite creations like jade\nGather precious collections, embrace all magnificent AI art',
    'home.searchPlaceholder': 'Search works...',
    'home.search': 'Search',
    'home.hotTags': 'Popular Tags',
    'home.clearFilter': 'Clear Filters',
    'home.currentFilter': 'Current Filters:',
    'home.searchColon': 'Search',
    'home.tag': 'Tag',
    'home.foundWorks': 'Found {count} work(s)',
    
    // Stats
    'stats.totalWorks': 'Total Works',
    'stats.totalViews': 'Total Views',
    'stats.totalLikes': 'Total Likes',
    'stats.sort': 'Sort by:',
    'stats.latest': 'Latest',
    'stats.views': 'Views',
    'stats.likes': 'Likes',
    'stats.title': 'Statistics',
    'stats.tagDistribution': 'Tag Distribution',
    'stats.monthlyTrend': 'Monthly Trend',
    'stats.topWorks': 'Top 10 Works',
    
    // Empty States
    'empty.noMatch': 'No Match',
    'empty.noMatchDesc': 'No matching works found, try other filters',
    'empty.noWorks': 'Awaiting Contributions',
    'empty.noWorksDesc': 'No works yet. Looking forward to your excellent creations\nBe the first fragrance in this collection',
    'empty.uploadWork': 'Upload Work',
    
    // Footer
    'footer.dataGlimpse': 'Data Overview',
    'footer.dataDesc': 'Record every spark of inspiration with numbers.',
    'footer.worksCount': 'Works',
    'footer.totalViews': 'Views',
    'footer.totalLikes': 'Likes',
    'footer.slogan': 'Curate Excellence, Collect Brilliance\nTreasure outstanding works created by Gemini 3.0',
    'footer.joinCreation': 'Join Creation',
    'footer.joinDesc': 'Submit your Gemini 3.0 masterpiece to this collection.',
    'footer.uploadWork': 'Upload Work',
    'footer.tags.illustration': 'Illustration',
    'footer.tags.3d': '3D Scene',
    'footer.tags.web': 'Web Design',
  },
}

export function useTranslation(locale: Locale = 'zh') {
  return (key: keyof typeof translations['zh'], params?: Record<string, string | number>) => {
    let text = translations[locale][key] || translations['zh'][key]
    
    // 替换参数
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, String(value))
      })
    }
    
    return text
  }
}

