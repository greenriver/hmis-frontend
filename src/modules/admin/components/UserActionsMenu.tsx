import CommonMenuButton from '@/components/elements/CommonMenuButton';

interface Props {
  onClickImpersonate: VoidFunction;
  isCurrentUser: boolean;
}

const UserActionsMenu: React.FC<Props> = ({
  onClickImpersonate,
  isCurrentUser,
}) => {
  const items = [
    {
      key: 'impersonate',
      onClick: onClickImpersonate,
      title: 'Impersonate User',
      disabled: isCurrentUser,
    },
  ];

  return (
    <CommonMenuButton title='User Actions' items={items} variant='outlined' />
  );
};

export default UserActionsMenu;
