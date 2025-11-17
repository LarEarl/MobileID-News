import { Article } from '../types/news';

export type RootStackParamList = {
  Login: undefined;
  NewsList: undefined;
  Favorites: undefined;
  ArticleDetail: { article: Article };
};
