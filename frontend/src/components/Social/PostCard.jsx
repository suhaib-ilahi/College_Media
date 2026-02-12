import { useState, useEffect } from 'react';

export default function PostCard({ post }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  useEffect(() => {
    fetchComments();
  }, [post._id]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });
      if (response.ok) {
        const newCommentData = await response.json();
        setComments([...comments, newCommentData]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setComments(comments.filter(c => c._id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 w-full md:max-w-2xl mx-auto shadow-sm">
      {/* Header: Avatar, Name, Title, Timestamp */}
      <div className="flex items-center mb-3">
        <img
          src={post.user.avatar || '/default-avatar.png'}
          alt={post.user.name}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h3 className="font-semibold text-sm text-gray-900">{post.user.name}</h3>
          <p className="text-xs text-gray-500">{formatTimestamp(post.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-800 mb-3 leading-relaxed">{post.content}</p>

      {/* Image */}
      {post.image && (
        <img
          src={`http://localhost:5000${post.image}`}
          alt="Post image"
          className="w-full h-auto rounded-lg mb-3"
        />
      )}

      {/* Engagement Stats */}
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>{post.likes?.length || 0} likes</span>
        <span>{post.comments?.length || 0} comments</span>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-around mt-2 border-t border-gray-100 pt-2">
        <button className="flex items-center text-sm text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
          👍 Like
        </button>
        <button className="flex items-center text-sm text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
          💬 Comment
        </button>
        <button className="flex items-center text-sm text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
          🔗 Share
        </button>
      </div>

      {/* Comments Section */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="mb-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddComment}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Comment
          </button>
        </div>
        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment._id} className="flex items-start space-x-2">
              <img
                src={comment.user.avatar || '/default-avatar.png'}
                alt={comment.user.name}
                className="w-6 h-6 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm">{comment.user.name}</span>
                  <span className="text-xs text-gray-500">{formatTimestamp(comment.date)}</span>
                </div>
                <p className="text-sm text-gray-800">{comment.text}</p>
              </div>
              {comment.user._id === user?.id && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
