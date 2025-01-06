import { NextPage } from 'next';
import { useCurrentUserContext } from '../context/UserContext';

const HomePage: NextPage = () => {
  const { currentUser } = useCurrentUserContext();

  return (
    <div>
      <div className="relative mt-5 p-0 w-full max-w-none">
        <p>howdy {currentUser?.email}</p>
      </div>
    </div>
  );
};

export default HomePage;
