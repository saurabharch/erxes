import BasicInfo from '../../containers/details/BasicInfo';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { IClientPortalUser } from '../../types';
import { IUser } from '@erxes/ui/src/auth/types';
import InfoSection from './InfoSection';
import LeftSidebar from './LeftSidebar';
import React from 'react';
import RightSidebar from './RightSidebar';
import { UserHeader } from '@erxes/ui-contacts/src/customers/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';

const ActivityInputs = asyncComponent(
  () =>
    isEnabled('logs') &&
    import(
      /* webpackChunkName: "ActivityInputs" */ '@erxes/ui-log/src/activityLogs/components/ActivityInputs'
    ),
);

type Props = {
  clientPortalUser: IClientPortalUser;
  currentUser: IUser;
  history: any;
};

const ClientPortalCompanyDetails: React.FC<Props> = (props: Props) => {
  const { clientPortalUser } = props;

  const renderContent = (content) => {
    if (isEnabled('logs')) {
      return content;
    }

    return (
      <EmptyState
        image="/images/actions/5.svg"
        text={__('No results found')}
        size="full"
      />
    );
  };

  const title = clientPortalUser.companyName || 'Unknown';

  const breadcrumb = [
    {
      title: __('ClientPortal Companies'),
      link: '/settings/client-portal/user',
    },
    { title },
  ];

  const content = (
    <>
      <ActivityInputs
        contentTypeId={clientPortalUser._id}
        contentType="clientPortalUser"
        showEmail={false}
      />
    </>
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      mainHead={
        <UserHeader>
          <InfoSection clientPortalUser={clientPortalUser}>
            <BasicInfo clientPortalUser={clientPortalUser} />
          </InfoSection>
        </UserHeader>
      }
      leftSidebar={<LeftSidebar {...props} />}
      rightSidebar={<RightSidebar clientPortalUser={clientPortalUser} />}
      content={renderContent(content)}
      transparent={true}
    />
  );
};

export default ClientPortalCompanyDetails;
