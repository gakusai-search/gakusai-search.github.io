export interface FieldCategoryDef {
  key: string;
  title: string;
  colorKey: "performance" | "creative" | "tech" | "society";
  colorName: string;
  tags: string[];
}

export const FIELD_CATEGORIES: FieldCategoryDef[] = [
  {
    key: "field:performance",
    title: "パフォーマンス",
    colorKey: "performance",
    colorName: "マゼンタ",
    tags: [
      "バンド・軽音楽",
      "ダンス",
      "お笑い",
      "演劇",
      "アカペラ・合唱",
      "クラシック・吹奏楽",
      "大道芸・マジック",
      "伝統芸能",
      "その他の音楽",
    ],
  },
  {
    key: "field:creative",
    title: "芸術とクリエイティブ",
    colorKey: "creative",
    colorName: "ライムグリーン",
    tags: [
      "美術・デザイン",
      "デジタルゲーム",
      "アニメ・マンガ・コスプレ",
      "写真・映像",
      "アナログゲーム",
      "文芸",
      "手芸・工芸",
    ],
  },
  {
    key: "field:tech",
    title: "科学とテクノロジー",
    colorKey: "tech",
    colorName: "シアン",
    tags: [
      "科学・実験",
      "ロボット・機械",
      "宇宙・航空・乗り物",
      "情報・プログラミング",
      "自然・環境・生物",
    ],
  },
  {
    key: "field:society",
    title: "社会と生活",
    colorKey: "society",
    colorName: "レモンイエロー",
    tags: [
      "学生生活・進路",
      "スポーツ・健康",
      "国際・語学",
      "地域・ボランティア",
      "歴史・社会・文化",
    ],
  },
];

const tagToFieldCategoryMap = new Map<string, FieldCategoryDef>();
FIELD_CATEGORIES.forEach((cat) => {
  cat.tags.forEach((tag) => {
    tagToFieldCategoryMap.set(tag, cat);
  });
});

export function getTagCategory(tag: string): FieldCategoryDef | undefined {
  return tagToFieldCategoryMap.get(tag);
}

export function getTagColorClass(tag: string): string {
  const cat = getTagCategory(tag);
  if (!cat) return "";
  return `tag-${cat.colorKey}`;
}

export interface SubCategoryGroup {
  key: string;
  title: string;
  colorKey?: "performance" | "creative" | "tech" | "society";
  tags: string[];
}

export interface CategoryGroup {
  key: string;
  categoryType: "date" | "format" | "field" | "features";
  title: string;
  tags?: string[];
  subCategories?: SubCategoryGroup[];
}

export function getSearchFilterCategories(projects: any[]): CategoryGroup[] {
  const usedFieldTags = new Set(
    projects.flatMap((p) => p.tags?.field || []),
  );

  const groups: CategoryGroup[] = [];

  // date
  const dateTags = [
    ...new Set(projects.flatMap((p) => p.tags?.date || [])),
  ] as string[];
  if (dateTags.length > 0) {
    groups.push({
      key: "date",
      categoryType: "date",
      title: "日程",
      tags: dateTags,
    });
  }

  // format
  const formatTags = [
    ...new Set(projects.flatMap((p) => p.tags?.format || [])),
  ] as string[];
  if (formatTags.length > 0) {
    groups.push({
      key: "format",
      categoryType: "format",
      title: "形式",
      tags: formatTags,
    });
  }

  // filed categories
  const subCategories: SubCategoryGroup[] = [];
  const registeredFieldTags = new Set<string>();

  FIELD_CATEGORIES.forEach((cat) => {
    const presentTags = cat.tags.filter((t) => usedFieldTags.has(t));
    cat.tags.forEach((t) => registeredFieldTags.add(t));
    if (presentTags.length > 0) {
      subCategories.push({
        key: cat.key,
        title: cat.title,
        colorKey: cat.colorKey,
        tags: presentTags,
      });
    }
  });

  // undefined field tags
  const unclassifiedFieldTags = Array.from(usedFieldTags).filter(
    (t) => !registeredFieldTags.has(t),
  );
  if (unclassifiedFieldTags.length > 0) {
    subCategories.push({
      key: "field:other",
      title: "その他分野",
      tags: unclassifiedFieldTags,
    });
  }

  if (subCategories.length > 0) {
    groups.push({
      key: "field",
      categoryType: "field",
      title: "分野",
      subCategories,
    });
  }

  // features
  const featuresTags = [
    ...new Set(projects.flatMap((p) => p.tags?.features || [])),
  ] as string[];
  if (featuresTags.length > 0) {
    groups.push({
      key: "features",
      categoryType: "features",
      title: "気になる条件",
      tags: featuresTags,
    });
  }

  return groups;
}
