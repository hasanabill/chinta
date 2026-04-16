import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MessagesPage from '../pages/Messages';
import PostDetails from '../pages/PostDetails';

const createJsonResponse = (data) => ({
  ok: true,
  json: async () => data,
});

describe('forum smoke tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('shows login prompt for inbox when unauthenticated', () => {
    render(
      <MemoryRouter>
        <MessagesPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Please login to use messaging.')).toBeInTheDocument();
  });

  it('renders post details and threaded replies', async () => {
    const postId = '64d15f5b5f17a4ef0f0f1111';

    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const requestUrl = String(url);

      if (requestUrl.endsWith(`/api/posts/${postId}`)) {
        return createJsonResponse({
          _id: postId,
          title: 'Main discussion',
          body: '<p>Core forum content</p>',
          author: { username: 'Amina' },
          upvotes: [],
          downvotes: [],
          tags: ['unity'],
          category: 'general',
        });
      }

      if (requestUrl.endsWith(`/api/posts/${postId}/replies`)) {
        return createJsonResponse([
          {
            _id: 'r1',
            body: 'This is a threaded reply.',
            author: { username: 'Bilal' },
          },
        ]);
      }

      if (requestUrl.includes('/api/posts?')) {
        return createJsonResponse([]);
      }

      return { ok: false, json: async () => ({}) };
    });

    render(
      <MemoryRouter initialEntries={[`/post/${postId}`]}>
        <Routes>
          <Route path="/post/:id" element={<PostDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Main discussion')).toBeInTheDocument();
      expect(screen.getByText('This is a threaded reply.')).toBeInTheDocument();
    });
  });
});
