import SimpleTable from '@/components/elements/SimpleTable';

interface Props {
  content:
    | Record<string, React.ReactNode>
    | Readonly<[React.ReactNode, React.ReactNode]>[];
  condensed?: boolean;
}

const ClientProfileCardTextTable: React.FC<Props> = ({
  content,
  condensed = true,
}) => {
  return (
    <SimpleTable
      TableCellProps={{
        sx: {
          borderBottom: 0,
          pt: 0,
          pb: condensed ? 1 : 2,
          px: 1,
          verticalAlign: 'baseline',
          '&:first-of-type': {
            pl: 0,
            pr: 2,
            width: '1px',
            whiteSpace: 'nowrap',
          },
        },
      }}
      columns={[
        {
          name: 'key',
          render: (row) => (
            <strong style={{ fontWeight: 600 }}>{row.label}</strong>
          ),
        },
        { name: 'value', render: (row) => row.value },
      ]}
      rows={(Array.isArray(content) ? content : Object.entries(content)).map(
        ([id, value], index) => ({ id: String(index), label: id, value })
      )}
    />
  );
};

export default ClientProfileCardTextTable;
