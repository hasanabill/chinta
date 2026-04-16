import { useParams } from 'react-router-dom';
import Timeline from './Timeline';

const ForumTag = () => {
    const { tag } = useParams();
    return <Timeline initialTag={tag || ''} />;
};

export default ForumTag;
