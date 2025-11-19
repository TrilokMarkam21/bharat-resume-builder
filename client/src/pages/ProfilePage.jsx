import { useParams } from "react-router-dom";

function ProfilePage() {
  const { resumeId } = useParams();

  return (
    <div>
      <h3>Public Profile</h3>
      <p>Resume ID: {resumeId}</p>
      <p>Mobile-friendly resume view will go here.</p>
    </div>
  );
}

export default ProfilePage;
