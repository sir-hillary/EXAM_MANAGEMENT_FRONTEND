import { useState } from "react";
import  PageHeader  from "../../components/ui/PageHeader";
import  Tabs  from "../../components/ui/Tabs";
import TeacherSubjectsTab from "./TeacherSubjectsTab";
import ClassSubjectsTab from "./ClassSubjectsTab";

const tabs = [
  { key: "teacher-subjects", label: "Teacher Qualifications" },
  { key: "class-subjects", label: "Class Subjects" },
];

const Assignments = () => {
  const [active, setActive] = useState("teacher-subjects");

  return (
    <div>
      <PageHeader
        title="Assignments"
        description="Qualify teachers for subjects, then offer subjects to classes"
      />

      <Tabs tabs={tabs} active={active} onChange={setActive} />

      {active === "teacher-subjects" ? (
        <TeacherSubjectsTab />
      ) : (
        <ClassSubjectsTab />
      )}
    </div>
  );
};

export default Assignments;
