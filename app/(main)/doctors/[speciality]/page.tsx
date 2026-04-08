import React from "react";

interface SpecialityPagePropType {
  params: Promise<{
    speciality: String;
  }>;
}

const SpecialityPage = async ({ params }: SpecialityPagePropType) => {
  const { speciality } = await params;
  return <div>SpecialityPage: {speciality}</div>;
};

export default SpecialityPage;
