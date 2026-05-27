import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteNews,
  getAllNews,
  getPublicNews,
  getPublicNewsBySlug,
  updateNewsVisibility,
} from '@/services/newsApi';
import type {
  NewsDetailResponse,
  NewsListResponse,
  NewsResponse,
  NewsVisibilityRequest,
} from '@/types/news.types';

interface NewsState {
  allNewsList: NewsListResponse[];
  newsList: NewsListResponse[];
  currentNews: NewsDetailResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: NewsState = {
  allNewsList: [],
  newsList: [],
  currentNews: null,
  loading: false,
  error: null,
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'News request failed';

export const fetchAllNews = createAsyncThunk(
  'news/fetchAllNews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllNews();
      return response.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchPublicNews = createAsyncThunk(
  'news/fetchPublicNews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPublicNews();
      return response.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchPublicNewsBySlug = createAsyncThunk(
  'news/fetchPublicNewsBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await getPublicNewsBySlug(slug);
      return response.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateVisibility = createAsyncThunk(
  'news/updateVisibility',
  async (
    { id, request }: { id: string; request: NewsVisibilityRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateNewsVisibility(id, request);
      return response.result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteNewsById = createAsyncThunk(
  'news/deleteNewsById',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteNews(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const upsertNewsListItem = (items: NewsListResponse[], item: NewsResponse) => {
  const index = items.findIndex((news) => news.id === item.id);
  if (index === -1) {
    items.push(item);
    return;
  }
  items[index] = item;
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    clearCurrentNews: (state) => {
      state.currentNews = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNews.fulfilled, (state, action) => {
        state.loading = false;
        state.allNewsList = action.payload;
      })
      .addCase(fetchAllNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPublicNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicNews.fulfilled, (state, action) => {
        state.loading = false;
        state.newsList = action.payload;
      })
      .addCase(fetchPublicNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPublicNewsBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicNewsBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNews = action.payload;
      })
      .addCase(fetchPublicNewsBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateVisibility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVisibility.fulfilled, (state, action) => {
        state.loading = false;
        upsertNewsListItem(state.allNewsList, action.payload);

        const publicIndex = state.newsList.findIndex(
          (news) => news.id === action.payload.id
        );
        if (action.payload.isPublic) {
          upsertNewsListItem(state.newsList, action.payload);
        } else if (publicIndex !== -1) {
          state.newsList.splice(publicIndex, 1);
        }
      })
      .addCase(updateVisibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteNewsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNewsById.fulfilled, (state, action) => {
        state.loading = false;
        state.allNewsList = state.allNewsList.filter(
          (news) => news.id !== action.payload
        );
        state.newsList = state.newsList.filter(
          (news) => news.id !== action.payload
        );
      })
      .addCase(deleteNewsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentNews, clearError } = newsSlice.actions;
export default newsSlice.reducer;
