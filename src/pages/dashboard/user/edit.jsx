import { useEffect } from 'react';
import { useParams } from 'src/routes/hooks';
import { useSelector } from 'react-redux';

import { CONFIG } from 'src/global-config';

import { UserEditView } from 'src/sections/user/view';
import { useUser } from 'src/hooks/useUser';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const metadata = { title: `User edit | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { userId = '' } = useParams();
  const { fetchUserById, clearCurrentUser, loading } = useUser();
  
  // Get currentUser from Redux store
  const currentUser = useSelector((state) => state.user.currentUser);
  useEffect(() => {
    if (userId) {
      fetchUserById(userId);
    }
  }, [userId, fetchUserById]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <title>{metadata.title}</title>

      <UserEditView user={currentUser} />
    </>
  );
}
