import { Language } from '../types/leave';

export const translations = {
  en: {
    appName: 'My Leave Tracker',
    appSubtitle: 'Personal Leave & Balance Manager',
    dashboard: 'My Leaves & Balances',
    calendarView: 'Calendar View',
    logLeave: '+ Log Leave',
    quotaSettings: 'Quota Settings',
    exportReport: 'Export / Print',
    
    // Summary Cards
    totalLeaves: 'Total Leaves',
    annualLeave: 'Annual Leave',
    casualLeave: 'Casual Leave',
    sickLeave: 'Sick Leave',
    specialLeave: 'Special Leave',
    remaining: 'Remaining',
    taken: 'Taken',
    totalAllowed: 'Total Allowed',
    days: 'days',
    day: 'day',
    
    // Status & Types
    fullDay: 'Full Day (1.0)',
    halfDay: 'Half Day (0.5)',
    morningHalf: 'Morning Half (0.5)',
    eveningHalf: 'Afternoon Half (0.5)',
    multiDay: 'Multiple Days',
    leavesList: 'My Leave History',
    statusTaken: 'Taken',
    statusApproved: 'Approved',
    statusPlanned: 'Planned',
    
    // Filter & Search
    searchPlaceholder: 'Search date or reason...',
    filterAll: 'All Categories',
    filterDuration: 'Duration',
    filterYear: 'Year',
    
    // Table Headers
    date: 'Date',
    category: 'Leave Category',
    duration: 'Duration (Full/Half)',
    daysCount: 'Days',
    reason: 'Reason / Notes',
    status: 'Status',
    actions: 'Action',
    deleteConfirm: 'Are you sure you want to delete this leave entry?',
    
    // Modal
    modalTitle: 'Log Leave Entry',
    selectCategory: 'Select Category',
    selectDuration: 'Duration (Full Day or Half Day)',
    startDate: 'Date / Start Date',
    endDate: 'End Date',
    reasonLabel: 'Reason for leave',
    reasonPlaceholder: 'e.g., Flu, Personal errand, Family vacation...',
    submitLeave: 'Save Leave',
    cancel: 'Cancel',
    balanceWarning: 'Notice: Only {balance} days remaining in this category!',
    
    // Quota Settings
    quotaTitle: 'My Annual Quota Settings',
    quotaDesc: 'Set your total allowed Annual, Casual, and Sick leaves for the year.',
    saveQuota: 'Save Quotas',
    
    noLeavesFound: 'No leaves recorded yet.',
    quickStatsTitle: 'My Leave Balance Summary',
    leaveUsageRate: 'Leave Utilization',
  },
  si: {
    appName: 'මගේ නිවාඩු සටහන (My Leaves)',
    appSubtitle: 'පෞද්ගලික නිවාඩු සහ ශේෂ කළමනාකරණය',
    dashboard: 'මගේ නිවාඩු සහ ශේෂය',
    calendarView: 'දින දර්ශනය (Calendar)',
    logLeave: '+ නිවාඩුවක් එක් කරන්න',
    quotaSettings: 'නිවාඩු සීමා සකසන්න',
    exportReport: 'වාර්තාව බාගත කරන්න',
    
    // Summary Cards
    totalLeaves: 'මුළු නිවාඩු',
    annualLeave: 'වාර්ෂික නිවාඩු (Annual)',
    casualLeave: 'අනියම් නිවාඩු (Casual)',
    sickLeave: 'ලෙඩ නිවාඩු (Sick)',
    specialLeave: 'විශේෂ නිවාඩු (Special)',
    remaining: 'ඉතිරිව ඇත',
    taken: 'භාවිත කළා',
    totalAllowed: 'මුළු හිමිකම',
    days: 'දින',
    day: 'දින',
    
    // Status & Types
    fullDay: 'සම්පූර්ණ දින (1.0)',
    halfDay: 'අර්ධ දින (0.5)',
    morningHalf: 'උදෑසන අර්ධ (0.5)',
    eveningHalf: 'සවස අර්ධ (0.5)',
    multiDay: 'දින කිහිපයක්',
    leavesList: 'මගේ නිවාඩු ලැයිස්තුව',
    statusTaken: 'ලබාගෙන ඇත',
    statusApproved: 'අනුමතයි',
    statusPlanned: 'සැලසුම් කළ',
    
    // Filter & Search
    searchPlaceholder: 'දිනය හෝ හේතුව සොයන්න...',
    filterAll: 'සියලුම වර්ග',
    filterDuration: 'කාලසීමාව',
    filterYear: 'වර්ෂය',
    
    // Table Headers
    date: 'දිනය',
    category: 'නිවාඩු වර්ගය',
    duration: 'කාලය (පූර්ණ / අර්ධ)',
    daysCount: 'දින ගණන',
    reason: 'හේතුව',
    status: 'තත්ත්වය',
    actions: 'ක්‍රියා',
    deleteConfirm: 'මෙම නිවාඩු සටහන ඉවත් කිරීමට ඔබට සහතිකද?',
    
    // Modal
    modalTitle: 'නව නිවාඩුවක් සටහන් කිරීම',
    selectCategory: 'නිවාඩු වර්ගය තෝරන්න',
    selectDuration: 'කාලසීමාව (පූර්ණ දින ද? අර්ධ දින ද?)',
    startDate: 'දිනය / ආරම්භක දිනය',
    endDate: 'අවසාන දිනය',
    reasonLabel: 'නිවාඩුවට හේතුව',
    reasonPlaceholder: 'උදා: උණ, පෞද්ගලික කටයුත්තක්, විවේක ගැනීම...',
    submitLeave: 'නිවාඩුව සුරකින්න',
    cancel: 'අවලංගු කරන්න',
    balanceWarning: 'අවධානයයි: මෙම වර්ගයේ ඉතිරිව ඇත්තේ දින {balance} ක් පමණි!',
    
    // Quota Settings
    quotaTitle: 'මගේ වාර්ෂික නිවාඩු හිමිකම් සැකසීම',
    quotaDesc: 'ඔබට වසරකට හිමි වාර්ෂික, අනියම් සහ ලෙඩ නිවාඩු ප්‍රමාණ මෙහි සකසන්න.',
    saveQuota: 'සුරකින්න',
    
    noLeavesFound: 'තවමත් කිසිදු නිවාඩුවක් සටහන් කර නොමැත.',
    quickStatsTitle: 'මගේ නිවාඩු ශේෂයේ සාරාංශය',
    leaveUsageRate: 'නිවාඩු භාවිතය',
  }
};

export const getTranslation = (lang: Language) => translations[lang];
