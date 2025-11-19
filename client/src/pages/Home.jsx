import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h3>Universal Resume Builder for Bharat Workforce</h3>
      <p>
        Choose how you want to create your resume: simple form input or voice/chat-style flow.
      </p>
      <Link to="/builder">Start building</Link>
    </div>
  );
}

export default Home;
