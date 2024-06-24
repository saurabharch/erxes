import { IContext } from '../../../messageBroker';
import { IMeeting } from '../../../models/definitions/meeting';

export default {
  async topics({ id }, _, { models }: IContext) {
    if (!id) {
      return null;
    }

    return await models.Topics.find({ meetingId: id });
  },

  async participantUser(meeting) {
    if (!meeting.participantIds) {
      return null;
    }

    return meeting.participantIds.map(participantId => {
      return {
        __typename: 'User',
        _id: participantId
      };
    });
  },

  async createdUser(meeting: IMeeting) {
    return (
      meeting.createdBy && {
        __typename: 'User',
        _id: meeting.createdBy
      }
    );
  },

  async deals({ dealIds }: IMeeting) {
    if (dealIds?.length === 0) {
      return;
    }
    return (dealIds || [])?.map(async dealId => {
      if (dealId) {
        return {
          __typename: 'Deal',
          _id: dealId
        };
      }
    });
  }
};
