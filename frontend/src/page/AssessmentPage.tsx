import EnforcedTimer from "../components/EnforcedTimer";

export default function AssessmentPage() {
  const attemptId = "ATTEMPT_101";

  return (
    <div>
      <h2>Online Assessment</h2>

      <EnforcedTimer attemptId={attemptId} />

      {/* Questions UI */}
      <textarea placeholder="Write your answer..." />

      <button>Submit</button>
    </div>
  );
}
