import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import { profilesAPI, matchesAPI, authAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [current, setCurrent] = useState(0);
  const [matches, setMatches] = useState([]);
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [currentSection, setCurrentSection] = useState('swipe');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      loadUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load profiles, matches, and liked profiles in parallel
      const [profilesRes, matchesRes, likedRes] = await Promise.all([
        profilesAPI.getAllProfiles(),
        matchesAPI.getMatches(),
        matchesAPI.getLikedProfiles()
      ]);

      setProfiles(profilesRes.data);
      setMatches(matchesRes.data);
      setLikedProfiles(likedRes.data);
      
      // Seed profiles if none exist
      if (profilesRes.data.length === 0) {
        await profilesAPI.seedProfiles();
        const newProfilesRes = await profilesAPI.getAllProfiles();
        setProfiles(newProfilesRes.data);
      }
      
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    loadUserData();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfiles([]);
    setMatches([]);
    setLikedProfiles([]);
    setCurrent(0);
    setCurrentSection('swipe');
  };

  const handleLike = async () => {
    if (!profiles[current]) return;
    
    try {
      const response = await matchesAPI.likeProfile(profiles[current]._id);
      
      if (response.data.isMatch) {
        // Refresh matches
        const matchesRes = await matchesAPI.getMatches();
        setMatches(matchesRes.data);
      }
      
      // Refresh liked profiles
      const likedRes = await matchesAPI.getLikedProfiles();
      setLikedProfiles(likedRes.data);
      
      nextProfile();
    } catch (err) {
      setError('Failed to like profile. Please try again.');
      console.error('Error liking profile:', err);
    }
  };

  const handleSuperLike = async () => {
    if (!profiles[current]) return;
    
    try {
      const response = await matchesAPI.superLikeProfile(profiles[current]._id);
      
      if (response.data.isMatch) {
        // Refresh matches
        const matchesRes = await matchesAPI.getMatches();
        setMatches(matchesRes.data);
      }
      
      // Refresh liked profiles
      const likedRes = await matchesAPI.getLikedProfiles();
      setLikedProfiles(likedRes.data);
      
      nextProfile();
    } catch (err) {
      setError('Failed to super like profile. Please try again.');
      console.error('Error super liking profile:', err);
    }
  };

  const handlePass = async () => {
    if (!profiles[current]) return;
    
    try {
      await matchesAPI.passProfile(profiles[current]._id);
      nextProfile();
    } catch (err) {
      console.error('Error passing profile:', err);
      nextProfile(); // Still move to next profile even if API call fails
    }
  };

  const nextProfile = () => {
    setCurrent((prev) => (prev + 1 < profiles.length ? prev + 1 : 0));
  };

  const removeMatch = async (profileId) => {
    try {
      await matchesAPI.removeMatch(profileId);
      
      // Refresh matches and liked profiles
      const [matchesRes, likedRes] = await Promise.all([
        matchesAPI.getMatches(),
        matchesAPI.getLikedProfiles()
      ]);
      
      setMatches(matchesRes.data);
      setLikedProfiles(likedRes.data);
    } catch (err) {
      setError('Failed to remove match. Please try again.');
      console.error('Error removing match:', err);
    }
  };

  const renderProfileDetails = (profile) => (
    <div className="profile-details">
      <div className="profile-header">
        <h2>{profile.name}, {profile.age}</h2>
        <p className="profile-job">{profile.job}</p>
      </div>
      
      <p className="profile-bio">{profile.bio}</p>
      
      <div className="profile-section">
        <h4>💼 Work & Education</h4>
        <p><strong>Job:</strong> {profile.job}</p>
        <p><strong>Education:</strong> {profile.education}</p>
      </div>

      <div className="profile-section">
        <h4>🎯 Looking For</h4>
        <p>{profile.lookingFor}</p>
      </div>

      <div className="profile-section">
        <h4>⭐ Interests</h4>
        <div className="interests-tags">
          {profile.interests.map((interest, index) => (
            <span key={index} className="interest-tag">{interest}</span>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <h4>🎨 Hobbies & Activities</h4>
        <ul className="hobbies-list">
          {profile.hobbies.map((hobby, index) => (
            <li key={index}>{hobby}</li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderSwipeSection = () => {
    if (loading) {
      return <div className="loading">Loading profiles...</div>;
    }

    if (profiles.length === 0) {
      return <div className="no-profiles">No profiles available</div>;
    }

    const profile = profiles[current];

    return (
      <div className="swipe-section">
        <div className="profile-card">
          <img src={profile.photo} alt={profile.name} className="profile-photo" />
          {renderProfileDetails(profile)}
          <div className="actions">
            <button className="pass" onClick={handlePass}>❌ Pass</button>
            <button className="super-like" onClick={handleSuperLike}>⭐ Super Like</button>
            <button className="like" onClick={handleLike}>💛 Like</button>
          </div>
          {matches.length >= 4 && (
            <p className="max-matches-warning">You've reached the maximum of 4 matches!</p>
          )}
        </div>
      </div>
    );
  };

  const renderMatchesSection = () => (
    <div className="matches-section">
      <h2>Your Matches ({matches.length}/4)</h2>
      {matches.length === 0 ? (
        <p className="no-matches">No matches yet. Start swiping!</p>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => (
            <div key={match.profileId._id} className="match-card">
              <img src={match.profileId.photo} alt={match.profileId.name} className="match-photo" />
              <div className="match-details">
                <h3>{match.profileId.name}, {match.profileId.age}</h3>
                <p className="match-job">{match.profileId.job}</p>
                <p className="match-bio">{match.profileId.bio}</p>
                <div className="match-interests">
                  <strong>Interests:</strong>
                  <div className="interests-tags small">
                    {match.profileId.interests.slice(0, 3).map((interest, index) => (
                      <span key={index} className="interest-tag small">{interest}</span>
                    ))}
                  </div>
                </div>
                {match.superLiked && <span className="super-like-badge">⭐ Super Liked</span>}
                <button 
                  className="remove-match-btn" 
                  onClick={() => removeMatch(match.profileId._id)}
                >
                  Remove Match
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLikedSection = () => (
    <div className="liked-section">
      <h2>People You've Liked ({likedProfiles.length})</h2>
      {likedProfiles.length === 0 ? (
        <p className="no-likes">You haven't liked anyone yet.</p>
      ) : (
        <div className="liked-grid">
          {likedProfiles.map((like) => (
            <div key={like.profileId._id} className="liked-card">
              <img src={like.profileId.photo} alt={like.profileId.name} className="liked-photo" />
              <div className="liked-details">
                <h3>{like.profileId.name}, {like.profileId.age}</h3>
                <p className="liked-job">{like.profileId.job}</p>
                <p className="liked-bio">{like.profileId.bio}</p>
                <div className="liked-interests">
                  <strong>Interests:</strong>
                  <div className="interests-tags small">
                    {like.profileId.interests.slice(0, 3).map((interest, index) => (
                      <span key={index} className="interest-tag small">{interest}</span>
                    ))}
                  </div>
                </div>
                {like.superLiked && <span className="super-like-badge">⭐ Super Liked</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Show authentication if user is not logged in
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="bumble-app">
      <div className="header">
        <h1 className="bumble-title">Bumble Clone</h1>
        <div className="user-info">
          <span>Welcome, {user.email}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      
      {error && (
        <div className="error-banner" onClick={() => setError('')}>
          {error} (Click to dismiss)
        </div>
      )}
      
      <div className="navigation">
        <button 
          className={`nav-btn ${currentSection === 'swipe' ? 'active' : ''}`}
          onClick={() => setCurrentSection('swipe')}
        >
          💛 Swipe
        </button>
        <button 
          className={`nav-btn ${currentSection === 'matches' ? 'active' : ''}`}
          onClick={() => setCurrentSection('matches')}
        >
          💕 Matches ({matches.length}/4)
        </button>
        <button 
          className={`nav-btn ${currentSection === 'liked' ? 'active' : ''}`}
          onClick={() => setCurrentSection('liked')}
        >
          ❤️ Liked ({likedProfiles.length})
        </button>
      </div>

      {currentSection === 'swipe' && renderSwipeSection()}
      {currentSection === 'matches' && renderMatchesSection()}
      {currentSection === 'liked' && renderLikedSection()}
    </div>
  );
}

export default App;
