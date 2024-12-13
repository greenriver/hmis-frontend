import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import GeolocationPlaceholderBox from '@/modules/geolocation/components/GeolocationPlaceholderBox';
import MultiGeolocationMap from '@/modules/geolocation/components/MultiGeolocationMap';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import {
  AllEnrollmentDetailsFragment,
  useGetEnrollmentGeolocationsQuery,
} from '@/types/gqlTypes';

interface Props {
  enrollment: AllEnrollmentDetailsFragment;
}
const EnrollmentLocationMap: React.FC<Props> = ({ enrollment }) => {
  const { data, loading, error } = useGetEnrollmentGeolocationsQuery({
    variables: { id: enrollment.id },
  });

  if (loading) {
    return (
      <GeolocationPlaceholderBox height={400}>
        <Loading />
      </GeolocationPlaceholderBox>
    );
  }

  if (error) throw error;
  if (!data?.enrollment) return null;
  if (data.enrollment.geolocations.length === 0) {
    return (
      <GeolocationPlaceholderBox height={400}>
        <Typography color='text.secondary'>Location not collected</Typography>
      </GeolocationPlaceholderBox>
    );
  }

  // TODO:
  //- resolve the metadata fields on Geolocation and show them here
  return (
    <MultiGeolocationMap
      geolocations={data.enrollment.geolocations}
      BaseMapContainerProps={{
        height: 400,
        sx: { '.leaflet-container': { borderRadius: 1 } },
      }}
      renderMarkerContent={(geolocation) => (
        <Stack gap={1}>
          <CommonLabeledTextBlock title='Client'>
            {clientBriefName(enrollment.client)}
          </CommonLabeledTextBlock>
          <CommonLabeledTextBlock title='Assessment/Form'>
            {geolocation.id}
          </CommonLabeledTextBlock>
          <CommonLabeledTextBlock title='Collected Time'>
            two
          </CommonLabeledTextBlock>
          <CommonLabeledTextBlock title='Collected By'>
            two
          </CommonLabeledTextBlock>
        </Stack>
      )}
    />
  );
};
export default EnrollmentLocationMap;
