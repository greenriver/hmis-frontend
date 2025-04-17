import { TimelapseRounded } from '@mui/icons-material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import AddchartRoundedIcon from '@mui/icons-material/AddchartRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArticleIcon from '@mui/icons-material/Article';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CallSplitRounded from '@mui/icons-material/CallSplitRounded';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import ContactsIcon from '@mui/icons-material/Contacts';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import Draw from '@mui/icons-material/Draw';
import EditIcon from '@mui/icons-material/Edit';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import Home from '@mui/icons-material/Home';
import ImageIcon from '@mui/icons-material/Image';
import LayersRounded from '@mui/icons-material/LayersRounded';
import LineStyleIcon from '@mui/icons-material/LineStyle';
import ListRounded from '@mui/icons-material/ListRounded';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MediationRoundedIcon from '@mui/icons-material/MediationRounded';
import MergeTypeRounded from '@mui/icons-material/MergeTypeRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PeopleIcon from '@mui/icons-material/People';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import Person from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import PlusOneIcon from '@mui/icons-material/PlusOne';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import SearchIcon from '@mui/icons-material/Search';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import WrapTextIcon from '@mui/icons-material/WrapText';
import { styled, SvgIconProps } from '@mui/material';
const IntakeAssessmentIcon = styled(ExitToAppRoundedIcon)<SvgIconProps>(() => ({
  transform: 'rotate(90deg)',
}));

export {
  AddIcon as AddIcon,
  PersonAddIcon as AddPersonIcon,
  DescriptionIcon as AssessmentIcon,
  ArrowBackIcon as BackIcon,
  CalendarTodayIcon as CalendarIcon,
  AutorenewRoundedIcon as ChangeRelationshipIcon,
  CheckRoundedIcon as CheckIcon,
  ClearIcon as ClearIcon,
  ContactsIcon as ContactsIcon, // no semantic meaning changing here, just keeping it here for consistency and ease of audit
  Person as ClientIcon,
  CloseIcon as CloseIcon,
  MediationRoundedIcon as ConditionalIcon,
  ContentCopyIcon as CopyIcon,
  DeleteIcon,
  ArrowDropDownRoundedIcon as DownIcon,
  DownloadIcon as DownloadIcon,
  EditIcon as EditIcon,
  Home as EnrollmentIcon,
  ExitToAppRoundedIcon as ExitAssessmentIcon,
  ExpandLessRoundedIcon as ExpandLessIcon,
  ExpandMoreRoundedIcon as ExpandMoreIcon,
  SwapVertRoundedIcon as SortIcon,
  FilterListRoundedIcon as FilterIcon,
  VisibilityRoundedIcon as AuditIcon,
  PeopleOutlineRoundedIcon as ImpersonateIcon,
  // Icons for Form Builder
  CheckBoxIcon as FormBooleanIcon,
  RadioButtonCheckedIcon as FormChoiceIcon,
  AttachMoneyIcon as FormCurrencyIcon,
  DateRangeIcon as FormDateIcon,
  LineStyleIcon as FormDisplayIcon,
  ArrowDropDownIcon as FormDropdownIcon,
  FileUploadIcon as FormFileIcon,
  SelectAllIcon as FormGroupIcon,
  ImageIcon as FormImageIcon,
  PlusOneIcon as FormIntegerIcon,
  LocationOnIcon as FormLocationIcon,
  ArticleIcon as FormObjectIcon,
  TextFieldsIcon as FormStringIcon,
  WrapTextIcon as FormTextIcon,
  AccessTimeIcon as FormTimeOfDayIcon,
  QrCodeScannerIcon as GenerateScanCardIcon,
  ArrowForwardRoundedIcon as GoToIcon,
  PeopleIcon as HouseholdIcon,
  IntakeAssessmentIcon,
  MergeTypeRounded as JoinIcon,
  AddchartRoundedIcon as ManageHouseholdIcon,
  MoreVertRoundedIcon as MoreMenuIcon,
  MyLocationIcon as MyLocationIcon,
  OpenInNewRoundedIcon as OpenInNewIcon,
  Person as PersonIcon,
  RestoreFromTrashIcon as RestoreDeletedIcon,
  CreditCardIcon as ScanCardIcon,
  SearchIcon as SearchIcon,
  PlaylistAddCheckIcon as ServiceListIcon,
  Draw as SignatureIcon,
  CallSplitRounded as SplitIcon,
  ArrowDropUpRoundedIcon as UpIcon,
  LayersRounded as DetailsIcon,
  ListRounded as TasksIcon,
  CheckCircleRounded as CompletedIcon,
  CancelIcon as DeclinedIcon,
  TimelapseRounded as InProgressIcon,
};
