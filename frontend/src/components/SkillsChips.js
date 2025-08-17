import React from 'react';

const SkillsChips = ({ skills, maxDisplay = 5 }) => {
  if (!skills) return null;

  // Handle both array and string formats
  let skillsArray;
  if (Array.isArray(skills)) {
    skillsArray = skills.filter(Boolean);
  } else if (typeof skills === 'string') {
    skillsArray = skills.split(',').map(skill => skill.trim()).filter(Boolean);
  } else {
    return null;
  }
  
  if (skillsArray.length === 0) return null;

  const displaySkills = skillsArray.slice(0, maxDisplay);
  const remainingCount = skillsArray.length - maxDisplay;

  return (
    <div className="skills-container">
      {displaySkills.map((skill, index) => (
        <span key={index} className="skill-chip">
          {skill}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="skill-chip" style={{ backgroundColor: '#f5f5f5', color: '#666' }}>
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};

export default SkillsChips;