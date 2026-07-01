import { ChildLessonView } from "@/components/child/aqlli/ChildLessonView";

type Props = { params: Promise<{ id: string }> };

export default async function ChildLessonPage({ params }: Props) {
  const { id } = await params;
  return <ChildLessonView lessonId={id} />;
}
