import { useState, useEffect } from 'react';
import PostCard from './PostCard';

export default function SocialFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/posts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setContent('');
        setImage(null);
      } else {
        console.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  if (loading) return <div className="text-center py-8">Loading posts...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Social Feed</h2>

      {/* Post Creation Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            required={!image}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center">
              <label className="cursor-pointer flex items-center text-gray-600 hover:text-gray-800">
                <span className="mr-2">📷</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {image ? image.name : 'Add Image'}
              </label>
              {image && (
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting || (!content.trim() && !image)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Posts List */}
      <div className="flex flex-col gap-4 space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No posts yet. Be the first to share something!
          </div>
        )}
      </div>
    </div>
  );
}
