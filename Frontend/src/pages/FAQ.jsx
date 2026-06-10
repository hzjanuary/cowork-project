const items = [
    {
        title: 'What can I upload?',
        body: 'The backend accepts authenticated image and PDF uploads through the file upload route, then stores Cloudinary metadata for OCR processing.'
    },
    {
        title: 'How are questions structured?',
        body: 'Questions support multiple choice, true/false, and short answer types with difficulty, answer, verification, status, optional source file, and optional test assignment.'
    },
    {
        title: 'How do tests work?',
        body: 'Tests are saved with a title, owner, time limit, visibility, and a question list. The current UI focuses on stable create, list, and delete workflows.'
    },
    {
        title: 'Why do teacher/admin actions look limited?',
        body: 'The backend role guards currently check boolean flags while accounts store a role string. The frontend avoids depending on those guarded actions until the API is aligned.'
    }
];

const FAQ = () => {
    return (
        <div className="page-stack">
            <section className="page-heading">
                <div>
                    <span className="eyebrow">Help</span>
                    <h1>Backend feature guide</h1>
                </div>
            </section>
            <section className="faq-list">
                {items.map((item) => (
                    <article className="panel" key={item.title}>
                        <h2>{item.title}</h2>
                        <p>{item.body}</p>
                    </article>
                ))}
            </section>
        </div>
    );
};

export default FAQ;
