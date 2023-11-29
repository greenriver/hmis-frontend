import useSafeParams from '@/hooks/useSafeParams';

const UserEditHistory: React.FC = () => {
  const { userId } = useSafeParams();
  return <>{userId}</>;
};

export default UserEditHistory;
