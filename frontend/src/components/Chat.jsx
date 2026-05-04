import React, { useState, useRef, useEffect } from 'react';
import '../styles/Chat.css';
import Header from './Header';
import Sidebar from './Sidebar';

const Chat = () => {
  const [currentModel, setCurrentModel] = useState('gpt-4');
  const [showQuestionsForm, setShowQuestionsForm] = useState(true);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const contentEndRef = useRef(null);

  // Questions form state
  const [formData, setFormData] = useState({
    contentType: '',
    tone: '',
    targetAudience: '',
    length: '',
    additionalDetails: '',
  });

  const scrollToEnd = () => {
    setTimeout(() => {
      contentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  useEffect(() => {
    if (currentResponse) {
      scrollToEnd();
    }
  }, [currentResponse]);

  const handleOptionSelect = (question, value) => {
    setFormData(prev => ({
      ...prev,
      [question]: prev[question] === value ? '' : value,
    }));
  };

  const handleTextChange = (e) => {
    setFormData(prev => ({
      ...prev,
      additionalDetails: e.target.value,
    }));
  };

  const handleGenerate = async () => {
    if (!formData.contentType || !formData.tone || !formData.targetAudience) {
      alert('Please select Content Type, Tone, and Target Audience');
      return;
    }

    setIsLoading(true);
    setShowQuestionsForm(false);

    try {
      const response = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: currentModel,
          contentType: formData.contentType,
          tone: formData.tone,
          targetAudience: formData.targetAudience,
          length: formData.length || 'medium',
          additionalDetails: formData.additionalDetails,
        }),
      });

      const data = await response.json();
      setCurrentResponse(data.content);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error generating content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowQuestionsForm(true);
    setCurrentResponse(null);
  };

  const regenerateWithSettings = () => {
    setShowQuestionsForm(true);
  };

  return (
    <div className="chat-container">
      <Sidebar currentModel={currentModel} setCurrentModel={setCurrentModel} />
      <div className="chat-main">
        <Header />
        <div className="chat-content">
          <div className="animated-bg">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>
          </div>

          {showQuestionsForm ? (
            <div className="split-screen">
              <div className="split-left">
                <div className="questions-form">
                  {currentResponse && (
                    <button className="back-btn" onClick={handleBack}>
                      ← Back to Questions
                    </button>
                  )}

                  <h2 className="form-title">Create Content</h2>
                  <p className="form-subtitle">Answer a few questions to generate personalized content</p>

                  {/* Content Type */}
                  <div className="question-group">
                    <label className="question-label">Content Type</label>
                    <div className="options-grid">
                      {['Blog Post', 'Social Media', 'Email', 'Product Description', 'Tutorial'].map(
                        (type) => (
                          <button
                            key={type}
                            className={`option-btn ${
                              formData.contentType === type ? 'active' : ''
                            }`}
                            onClick={() => handleOptionSelect('contentType', type)}
                          >
                            {type}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Tone */}
                  <div className="question-group">
                    <label className="question-label">Tone</label>
                    <div className="options-grid">
                      {['Professional', 'Casual', 'Friendly', 'AuthoritativeExpository'].map((tone) => (
                        <button
                          key={tone}
                          className={`option-btn ${formData.tone === tone ? 'active' : ''}`}
                          onClick={() => handleOptionSelect('tone', tone)}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="question-group">
                    <label className="question-label">Target Audience</label>
                    <div className="options-grid">
                      {['Beginners', 'Professionals', 'Experts', 'General Public', 'Students'].map(
                        (audience) => (
                          <button
                            key={audience}
                            className={`option-btn ${
                              formData.targetAudience === audience ? 'active' : ''
                            }`}
                            onClick={() => handleOptionSelect('targetAudience', audience)}
                          >
                            {audience}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Length */}
                  <div className="question-group">
                    <label className="question-label">Length</label>
                    <div className="options-grid">
                      {['Short', 'Medium', 'Long'].map((length) => (
                        <button
                          key={length}
                          className={`option-btn ${formData.length === length ? 'active' : ''}`}
                          onClick={() => handleOptionSelect('length', length)}
                        >
                          {length}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="question-group full-width">
                    <label className="question-label">Additional Details (Optional)</label>
                    <textarea
                      className="specifics-input"
                      placeholder="Any specific details or requirements you'd like to include?"
                      value={formData.additionalDetails}
                      onChange={handleTextChange}
                    />
                  </div>

                  <button
                    className="generate-btn-main"
                    onClick={handleGenerate}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Generating...' : 'Generate Content'}
                  </button>
                </div>
              </div>

              {currentResponse && (
                <div className="split-right">
                  <div className="response-preview">
                    <h3>Generated Content</h3>
                    <div className="response-text">{currentResponse}</div>
                    <button
                      className="regenerate-btn"
                      onClick={regenerateWithSettings}
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="response-full">
              <button className="back-btn" onClick={handleBack}>
                ← Back to Questions
              </button>
              <div className="response-content">
                <div className="response-text">{currentResponse}</div>
                <button className="regenerate-btn" onClick={regenerateWithSettings}>
                  Regenerate
                </button>
              </div>
            </div>
          )}

          <div ref={contentEndRef} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
