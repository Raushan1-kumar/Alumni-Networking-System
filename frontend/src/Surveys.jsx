import { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, CheckCircle } from 'lucide-react';

const Surveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/surveys', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // For demo, just show active surveys
      setSurveys(res.data.filter(s => s.isActive));
    } catch (error) {
      console.error('Failed to fetch surveys', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionIndex, value) => {
    setResponses({
      ...responses,
      [questionIndex]: value
    });
  };

  const handleSubmitSurvey = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // format responses as expected by backend backend
      const answersList = Object.keys(responses).map(idx => ({
        questionIndex: Number(idx),
        answer: responses[idx]
      }));

      await axios.post(`http://localhost:5000/api/surveys/${selectedSurvey._id}/respond`, {
        answers: answersList
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Survey submitted successfully! Thank you for your feedback.");
      setSelectedSurvey(null);
      setResponses({});
    } catch (error) {
      alert("Failed to submit survey. You might have already responded.");
    }
  };

  if (selectedSurvey) {
    return (
      <div className="container mt-4">
        <button className="btn btn-outline mb-4" onClick={() => setSelectedSurvey(null)}>← Back to Surveys</button>
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="mb-2">{selectedSurvey.title}</h2>
          <p className="text-muted mb-4">{selectedSurvey.description}</p>
          
          <form onSubmit={handleSubmitSurvey}>
            {selectedSurvey.questions.map((q, index) => (
              <div key={q._id} className="mb-4 p-3" style={{ backgroundColor: 'var(--background)', borderRadius: '8px' }}>
                <label className="form-label mb-2" style={{ fontSize: '1.1rem' }}>
                  {index + 1}. {q.questionText} {q.isRequired && <span className="text-danger">*</span>}
                </label>
                
                {q.questionType === 'text' && (
                  <textarea 
                    className="form-control" rows="2" required={q.isRequired}
                    onChange={(e) => handleResponseChange(index, e.target.value)}
                  ></textarea>
                )}
                
                {q.questionType === 'multiple-choice' && (
                  <div className="flex flex-col gap-2">
                    {q.options?.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name={`q_${index}`} 
                          value={opt} 
                          required={q.isRequired}
                          onChange={(e) => handleResponseChange(index, e.target.value)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                
                {q.questionType === 'rating' && (
                  <select 
                    className="form-control" required={q.isRequired}
                    onChange={(e) => handleResponseChange(index, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Select Rating</option>
                    {[1, 2, 3, 4, 5].map(v => (
                      <option key={v} value={v}>{v} - {v === 5 ? 'Excellent' : v === 1 ? 'Poor' : 'Standard'}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
            <button type="submit" className="btn btn-primary btn-block text-center mt-4">Submit Feedback</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <h2>Feedback & Surveys</h2>
        <p>Help us improve your alumni experience by sharing your thoughts.</p>
      </div>

      {loading ? (
        <p className="text-center">Loading Surveys...</p>
      ) : surveys.length === 0 ? (
        <div className="card text-center text-muted">No active surveys at the moment.</div>
      ) : (
        <div className="grid grid-cols-2">
          {surveys.map(survey => (
            <div className="card flex-col" key={survey._id}>
              <div className="flex items-center gap-2 mb-2 text-primary">
                <ClipboardList size={24} />
                <h3 style={{ margin: 0 }}>{survey.title}</h3>
              </div>
              <p className="text-muted mb-3 flex-grow">{survey.description}</p>
              
              <div className="flex justify-between items-center mt-3" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.85rem' }} className="text-muted">
                  {survey.questions?.length || 0} Questions
                </span>
                <button className="btn btn-primary" onClick={() => setSelectedSurvey(survey)}>
                  Take Survey
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Surveys;
