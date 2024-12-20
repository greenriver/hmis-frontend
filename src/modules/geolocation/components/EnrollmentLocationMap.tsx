import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import GeolocationPlaceholderBox from '@/modules/geolocation/components/GeolocationPlaceholderBox';
import MultiGeolocationMap from '@/modules/geolocation/components/MultiGeolocationMap';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import { useGetEnrollmentGeolocationsQuery } from '@/types/gqlTypes';

interface Props {
  enrollmentId: string;
  clientName: string;
}

const EnrollmentLocationMap: React.FC<Props> = ({
  enrollmentId,
  clientName,
}) => {
  const { data, loading, error } = useGetEnrollmentGeolocationsQuery({
    variables: { id: enrollmentId },
    fetchPolicy: 'cache-and-network',
  });

  // fill most of page for mobile/tablet
  // this could be improved by using breakpoints, to make the map smaller on desktop
  const mapHeight = '60vh';

  if (loading) {
    return (
      <GeolocationPlaceholderBox height={mapHeight}>
        <Loading />
      </GeolocationPlaceholderBox>
    );
  }

  if (error) throw error;
  if (!data?.enrollment) return null;
  if (data.enrollment.geolocations.length === 0) {
    return (
      <GeolocationPlaceholderBox height={mapHeight}>
        <Typography color='text.secondary'>Location not collected</Typography>
      </GeolocationPlaceholderBox>
    );
  }

  return (
    <MultiGeolocationMap
      geolocations={data.enrollment.geolocations}
      BaseMapContainerProps={{
        height: mapHeight,
        sx: { '.leaflet-container': { borderRadius: 1 } },
      }}
      renderMarkerContent={(geolocation) => (
        <Stack gap={1}>
          <CommonLabeledTextBlock title='Client'>
            {clientName}
          </CommonLabeledTextBlock>
          <CommonLabeledTextBlock title='Collected Time'>
            {parseAndFormatDateTime(geolocation.locatedAt)}
          </CommonLabeledTextBlock>
          <CommonLabeledTextBlock title='Collected By'>
            {geolocation.collectedBy?.name || 'Unknown'}
          </CommonLabeledTextBlock>
          <CommonLabeledTextBlock title='Collection Point'>
            {geolocation.sourceFormName || 'Unknown'}
          </CommonLabeledTextBlock>
        </Stack>
      )}
    />
  );
};
export default EnrollmentLocationMap;
