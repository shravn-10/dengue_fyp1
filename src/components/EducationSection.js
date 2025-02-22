import React from "react";
import dengueImage from "../children_dengue.png"; 
import urbImage from "../urbanization.png"; 
import waterImage from "../water_stg.png"; 
import "../styles.css";

const articles = [
  {
    title: "Water Stagnation: A modern challenge",
    description: "Contribution of stagnation in Bengaluru towards Dengue",
    link: "https://www.thehindu.com/news/cities/bangalore/water-stagnation-in-several-places-in-bengaluru-even-as-dengue-cases-on-the-rise/article68380568.ece",
    image: <img src={waterImage} style={{ width: "60%" }} alt="water stagnation" />,
  },
  {
    title: "Dengue due to Urbanization",
    description: "Urban Growth, Rising Threat: Tackling Dengue in Cityscapes",
    link: "https://continentalhospitals.com/blog/rise-of-zika-and-dengue-fever-in-urban-areas/",
    image: <img src={urbImage} style={{ width: "80%" }} alt="Urbaniztion" />,
  },
  {
    title: "Dengue Fever in Children",
    description: "Explore the impact of dengue on children",
    link: "https://www.apollohospitals.com/patient-care/health-and-lifestyle/our-doctors-talk/dengue-fever-in-children/",
    image: <img src={dengueImage} style={{ width: "80%" }} alt="Dengue in Children" />,
  },
];

const faqs = [
  {
    question: "What are the main symptoms of Dengue?",
    answer: (
      <>
        <p style={{ marginTop: "10px", fontSize: "12px" }}>
          The main symptoms typically appear <strong>4–10 days</strong> after being bitten by an infected mosquito and can last for <strong>2–7 days</strong>.
        </p>
        <div style={{ marginTop: "10px", fontSize: "12px" }}>
          <strong>High fever</strong> (up to 104°F or 40°C) <br />
          <strong>Pain behind the eyes</strong> <br />
          <strong>Muscle, bone, and joint pain</strong> ("breakbone fever") <br />
          <strong>Nausea and vomiting</strong> <br />
          <strong>Fatigue and weakness</strong> <br />
          <strong>Skin rash</strong> (appears <strong>2–5 days</strong> after fever onset) <br />
          <strong>Mild bleeding</strong> (nosebleeds, gum bleeding, easy bruising) <br />
        </div>
      </>
    ),
  },
  {
    question: "How is Dengue transmitted?",
    answer: (
      <>
        <p style={{ marginTop: "10px", fontSize: "12px" }}>
          Dengue is <strong>not spread directly from person to person</strong>. Instead, it is transmitted through the bite of infected female <strong>Aedes aegypti</strong> or <strong>Aedes albopictus</strong> mosquitoes.
        </p>
        <h4 style={{ marginTop: "10px", fontSize: "12px" }}>How Dengue Spreads:</h4>
        <div style={{ fontSize: "12px" }}>
          Mosquitoes bite an <strong>infected person</strong> and pick up the virus. <br />
          The <strong>infected mosquito</strong> then bites a healthy person, transmitting the virus. <br />
        </div>
        <h4 style={{ marginTop: "10px", fontSize: "12px" }}>Other Rare Transmission Methods:</h4>
        <div style={{ fontSize: "12px" }}>
          <strong>Blood transfusions</strong> from infected donors <br />
          <strong>Organ transplants</strong> <br />
          <strong>Mother-to-baby transmission</strong> during pregnancy or childbirth <br />
        </div>
      </>
    ),
  },
  {
    question: "What should I do if I suspect I am infected with Dengue?",
    answer: (
      <>
        <h4 style={{ marginTop: "10px", fontSize: "12px" }}>Emergency Contacts for Dengue in India</h4>
        <div style={{ fontSize: "12px" }}>
          <strong>Health Ministry Helpline:</strong> 1075 (24/7) <br />
          <strong>Disaster Helpline:</strong> 1077 <br />
          <strong>Ambulance:</strong> 102 <br />
          <strong>Local Health Authority:</strong> Contact your state health department <br />
        </div>
        <h4 style={{ marginTop: "10px", fontSize: "12px" }}>What to Do if You Suspect Dengue</h4>
        <div style={{ fontSize: "12px" }}>
          <strong>Seek medical help immediately</strong> for proper diagnosis and treatment. <br />
          <strong>Stay hydrated</strong> and <strong>get plenty of rest</strong>. <br />
          Use <strong>paracetamol for fever</strong> but <strong>avoid aspirin/ibuprofen</strong>. <br />
          <strong>Monitor symptoms</strong> like severe pain, vomiting, or bleeding. <br />
          <strong>Prevent mosquito bites</strong> with repellents and protective clothing. <br />
        </div>
      </>
    ),
  },
];

const EducationSection = () => {
  return (
    
    <div className="education-section">
      <h2 style={{fontSize:"28px"}}>Quick Reads</h2>
      <div className="articles-container">
        {articles.map((article, index) => (
          <div className="article-card" key={index}>
            {typeof article.image === "string" ? <img src={article.image} alt={article.title} style={{ width: "80%" }} /> : article.image}
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
