import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ProjectCreationWizard from '@/app/components/projects/ProjectCreationWizard';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'projects' });
  
  return {
    title: `${t('createProject')} | BuildTrack Pro`,
    description: t('createProjectMetaDescription'),
  };
}

export default async function CreateProjectPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  return (
    <div className="container px-4 py-6 mx-auto">
      <ProjectCreationWizard locale={locale} />
    </div>
  );
}
