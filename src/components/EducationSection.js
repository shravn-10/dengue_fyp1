import React from "react";
import "../styles.css";

const articles = [
  {
    title: "Understanding Dengue Symptoms",
    description: "Learn about early warning signs and when to seek medical attention.",
    link: "#",
    image: "path-to-symptoms-image.png",
  },
  {
    title: "Prevention Methods",
    description: "Effective ways to protect your home and family from dengue.",
    link: "#",
    image: "path-to-prevention-image.png",
  },
  {
    title: "Treatment Guidelines",
    description: "Standard procedures for dengue treatment and recovery.",
    link: "#",
    image: "path-to-treatment-image.png",
  },
];

const faqs = [
  {
    question: "What are the main symptoms of Dengue?",
    answer: (
      <>
        <p style={{marginTop:"20px",fontSize:"12px"}}>
          The main symptoms of Dengue typically appear <strong>4–10 days</strong> after being bitten by an infected mosquito and can last for <strong>2–7 days</strong>.
        </p>
        <ul style={{marginRight:"25px",marginTop:"20px",fontSize:"10px"}}>
           <strong>High fever</strong> (up to 104°F or 40°C)<br></br>
           <strong>Pain behind the eyes</strong><br></br>
           <strong>Muscle, bone, and joint pain</strong> ("breakbone fever")<br></br>
           <strong>Nausea and vomiting</strong><br></br>
           <strong>Fatigue and weakness</strong><br></br>
           <strong>Skin rash</strong> (appears <strong>2–5 days</strong> after fever onset)<br></br>
           <strong>Mild bleeding</strong> (nosebleeds, gum bleeding, easy bruising)<br></br>
        </ul>
        <p style={{marginTop:"20px",fontSize:"12px"}}>
           In severe cases, Dengue can develop into <strong>Dengue Hemorrhagic Fever</strong> or <strong>Dengue Shock Syndrome</strong>, requiring <strong>immediate medical attention</strong>.
        </p>
        <p style={{marginTop:"20px",fontSize:"12px"}}> Seek medical care if you experience:</p>
        <ul style={{marginRight:"25px",fontSize:"10px"}}>
          Severe <strong>abdominal pain</strong><br></br>
          Persistent <strong>vomiting</strong><br></br>
          Uncontrolled <strong>bleeding</strong><br></br>
          <strong>Difficulty breathing</strong><br></br>
        </ul>
      </>
    ),
  },
  {
    question: "How is Dengue transmitted?",
    answer: (
      <>
        <p style={{marginTop:"20px",fontSize:"12px"}}>
          Dengue is <strong>not spread directly from person to person</strong>. Instead, it is transmitted through the bite of infected female <strong>Aedes aegypti</strong> or <strong>Aedes albopictus</strong> mosquitoes.
        </p>
        <h4 style={{marginTop:"20px",fontSize:"12px"}}> How Dengue Spreads:</h4>
        <ul style={{fontSize:"10px",marginRight:"25px"}}>
          Mosquitoes bite an <strong>infected person</strong> and pick up the virus.
          The <strong>infected mosquito</strong> then bites a healthy person, transmitting the virus.
        </ul>
        <h4 style={{marginTop:"20px",fontSize:"12px"}}> Other Rare Transmission Methods:</h4>
        <ul style={{marginTop:"20px",fontSize:"10px",marginRight:"35px"}} >
          <strong>Blood transfusions</strong> from infected donors <br></br>
          <strong>Organ transplants</strong> <br></br>
          <strong>Mother-to-baby transmission</strong> during pregnancy or childbirth <br></br>
        </ul>
        <p style={{marginTop:"20px",fontSize:"12px"}}> The mosquitoes that spread Dengue are <strong>most active during early morning and late afternoon hours</strong>.</p>
      </>
    ),
  },
  {
    question: "What should I do if I suspect I am infected with Dengue?",
    answer: (
      <>
        <h4 style={{marginTop:"20px",fontSize:"12px",}}> Emergency Contacts for Dengue in India</h4>
        <ul style={{marginTop:"20px",fontSize:"10px",marginRight:"35px"}}>
           <strong>Health Ministry Helpline:</strong> 1075 (24/7) <br></br>
           <strong>Disaster Helpline:</strong> 1077 <br></br>
           <strong>Ambulance:</strong> 102 <br></br>
           <strong>Local Health Authority:</strong> Contact your state health department <br></br>
        </ul>
        <h4 style={{marginTop:"20px",fontSize:"12px"}}> What to Do if You Suspect Dengue</h4>
        <ul style={{marginTop:"20px",fontSize:"10px",marginRight:"25px"}}>
           <strong>Seek medical help immediately</strong> for proper diagnosis and treatment. <br></br>
           <strong>Stay hydrated</strong> and <strong>get plenty of rest</strong>. <br></br>
           Use <strong>paracetamol for fever</strong> but  <strong>avoid aspirin/ibuprofen</strong>. <br></br>
           <strong>Monitor symptoms</strong> like severe pain, vomiting, or bleeding. <br></br>
           <strong>Prevent mosquito bites</strong> with repellents and protective clothing. <br></br>
        </ul>
        <p>
           More info: <a href="#">National Dengue Guidelines</a>
        </p>
      </>
    ),
  },
];

const EducationSection = () => {
  return (
    <div className="education-section">
      <h2>Latest Articles</h2>
      <div className="articles-container">
        {articles.map((article, index) => (
          <div className="article-card" key={index}>
            <img src={article.image} alt={article.title} />
            <h3>{article.title}</h3>
            <p>{article.description}</p>
            <a href={article.link}>Read More →</a>
          </div>
        ))}
      </div>

      <h2>Frequently Asked Questions</h2>
      <div className="faq-container">
        {faqs.map((faq, index) => (
          <details key={index} className="faq-item">
            <summary>{faq.question}</summary>
            <div className="faq-answer">{faq.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default EducationSection;
