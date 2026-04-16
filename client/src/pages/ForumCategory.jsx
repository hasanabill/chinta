import { useParams } from 'react-router-dom';
import Timeline from './Timeline';

const ForumCategory = () => {
    const { category } = useParams();
    return <Timeline initialCategory={category || ''} />;
};

export default ForumCategory;
