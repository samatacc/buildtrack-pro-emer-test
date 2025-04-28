'use client';

import React, { useState } from 'react';
import ProfileCard from './ProfileCard';
import FormInput from './FormInput';
import { ProfileData } from '@/lib/api/profile-client';

interface ProfessionalInfoProps {
  profile: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => Promise<void>;
  className?: string;
}

/**
 * ProfessionalInfo component
 * 
 * Allows construction professionals to manage their skills, certifications,
 * and other professional information with a mobile-optimized interface.
 */
export default function ProfessionalInfo({ 
  profile, 
  onUpdate,
  className = ''
}: ProfessionalInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState(profile.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [certifications, setCertifications] = useState(profile.certifications || []);
  const [newCertification, setNewCertification] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      setCertifications([...certifications, {
        name: newCertification.trim(),
        issueDate: new Date().toISOString().split('T')[0],
        issuedBy: ''
      }]);
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (certName: string) => {
    setCertifications(certifications.filter(cert => 
      typeof cert === 'string' ? cert !== certName : cert.name !== certName
    ));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate({
        skills,
        certifications
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update professional info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSkills(profile.skills || []);
    setCertifications(profile.certifications || []);
    setIsEditing(false);
  };

  return (
    <ProfileCard
      title="Professional Information"
      className={className}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      {isEditing ? (
        <div className="space-y-6">
          {/* Skills section */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Skills</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill, index) => (
                <div 
                  key={index} 
                  className="bg-gray-100 rounded-lg px-3 py-2 flex items-center group"
                >
                  <span>{typeof skill === 'string' ? skill : skill.toString()}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(typeof skill === 'string' ? skill : skill.toString())}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <FormInput
                label=""
                placeholder="Add a skill (e.g., Plumbing, Electrical, etc.)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                containerClassName="flex-1"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="ml-2 mt-[2px] px-4 py-3 bg-[rgb(24,62,105)] text-white rounded-2xl hover:bg-[rgb(19,49,84)] transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Certifications section */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Certifications & Licenses</h4>
            <div className="space-y-3 mb-3">
              {certifications.map((cert, index) => (
                <div 
                  key={index} 
                  className="bg-gray-100 rounded-lg px-4 py-3 flex justify-between items-center"
                >
                  <span className="font-medium">
                    {typeof cert === 'string' ? cert : cert.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertification(typeof cert === 'string' ? cert : cert.name)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <FormInput
                label=""
                placeholder="Add a certification (e.g., OSHA 30, Contractor License)"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCertification();
                  }
                }}
                containerClassName="flex-1"
              />
              <button
                type="button"
                onClick={handleAddCertification}
                className="ml-2 mt-[2px] px-4 py-3 bg-[rgb(24,62,105)] text-white rounded-2xl hover:bg-[rgb(19,49,84)] transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Skills section */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Skills</h4>
            {skills && skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 rounded-lg px-3 py-2 text-gray-800"
                  >
                    {typeof skill === 'string' ? skill : skill.toString()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No skills added yet</p>
            )}
          </div>

          {/* Certifications section */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Certifications & Licenses</h4>
            {certifications && certifications.length > 0 ? (
              <div className="space-y-3">
                {certifications.map((cert, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-100 rounded-lg px-4 py-3"
                  >
                    <div className="font-medium">
                      {typeof cert === 'string' ? cert : cert.name}
                    </div>
                    {typeof cert !== 'string' && cert.issuedBy && (
                      <div className="text-sm text-gray-600 mt-1">
                        Issued by: {cert.issuedBy}
                        {cert.issueDate && ` on ${new Date(cert.issueDate).toLocaleDateString()}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No certifications added yet</p>
            )}
          </div>
        </div>
      )}
    </ProfileCard>
  );
}
