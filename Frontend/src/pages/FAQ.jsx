import { useState } from 'react';
// import './FAQ.css';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: 'How do I create an account?',
            answer: 'Click on "Register" and fill in your email, username, and password. You\'ll receive a verification email to confirm your account.'
        },
        {
            question: 'How do I reset my password?',
            answer: 'Click on "Forgot Password" on the login page. Enter your email and you\'ll receive a reset code to create a new password.'
        },
        {
            question: 'How do I create a test?',
            answer: 'After logging in, go to the "Tests" section and click "Create New Test". Add questions and configure the test settings.'
        },
        {
            question: 'How do I add questions to a test?',
            answer: 'While editing a test, click "Add Question" to create new questions or search existing ones to add to your test.'
        },
        {
            question: 'Can I edit a test after creating it?',
            answer: 'Yes, you can edit the test title, time limit, and visibility. You can also add or remove questions.'
        },
        {
            question: 'How are tests graded?',
            answer: 'Multiple choice and true/false questions are graded automatically. Short answer questions may require manual verification by teachers.'
        },
        {
            question: 'Can I see my test results?',
            answer: 'Yes, after submitting a test, you can view your results including your score and detailed answers.'
        },
        {
            question: 'How do I upload my avatar?',
            answer: 'Go to your profile and click "Change Avatar" to upload a new profile picture.'
        },
        {
            question: 'What file formats are supported for uploads?',
            answer: 'We support JPG, PNG, and PDF formats for document uploads and OCR processing.'
        },
        {
            question: 'How do I become a teacher?',
            answer: 'Contact the admin panel. Admins can assign teacher roles to accounts through the account management section.'
        }
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="faq-container">
            <div className="faq-header">
                <h2>Frequently Asked Questions</h2>
                <p>Find answers to common questions about using our platform</p>
            </div>

            <div className="faq-list">
                {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                        <div
                            className="faq-question"
                            onClick={() => toggleFAQ(index)}
                        >
                            <h3>{faq.question}</h3>
                            <span className={`toggle-icon ${openIndex === index ? 'open' : ''}`}>
                                ▼
                            </span>
                        </div>
                        {openIndex === index && (
                            <div className="faq-answer">
                                <p>{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
