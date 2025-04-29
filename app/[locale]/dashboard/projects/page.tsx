import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ProjectList from '@/app/components/projects/ProjectList';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'projects' });
  
  return {
    title: `${t('projectsTitle')} | BuildTrack Pro`,
    description: t('projectsMetaDescription'),
  };
}

export default async function ProjectsPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  return (
    <div className="container px-4 py-6 mx-auto">
      <ProjectList locale={locale} />
    </div>
  );
}
