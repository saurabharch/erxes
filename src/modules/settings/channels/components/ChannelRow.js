import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ChannelForm } from '../containers';
import { ModalTrigger, Tip, Button, Icon } from 'modules/common/components';
import {
  SidebarListItem,
  ManageActions,
  Members,
  MemberImg,
  More,
  Row,
  RowContent,
  ActionButtons
} from '../styles';

const propTypes = {
  channel: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  isActive: PropTypes.bool
};

class ChannelRow extends Component {
  constructor(props) {
    super(props);

    this.renderEditForm = this.renderEditForm.bind(this);
    this.renderMember = this.renderMember.bind(this);
    this.remove = this.remove.bind(this);
    this.renderEditAction = this.renderEditAction.bind(this);
  }

  remove() {
    const { remove, channel } = this.props;
    remove(channel._id);
  }

  renderEditAction() {
    const { channel, save, members } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger size={this.size} title="Edit" trigger={editTrigger}>
        {this.renderEditForm({ channel, save, members })}
      </ModalTrigger>
    );
  }

  renderEditForm(props) {
    return <ChannelForm {...props} />;
  }

  renderMember(member) {
    return (
      <Tip key={member._id} text={member.details.fullName} placement="top">
        <MemberImg
          key={member._id}
          src={
            (member.details && member.details.avatar) ||
            '/images/avatar-colored.png'
          }
        />
      </Tip>
    );
  }

  render() {
    const { channel, members, isActive } = this.props;
    const limit = 8;
    let selectedMembers = [];

    if (channel) {
      selectedMembers = members.filter(u => channel.memberIds.includes(u._id));
    }
    const length = selectedMembers.length;

    return (
      <SidebarListItem key={channel._id} isActive={isActive}>
        <Row>
          <Link to={`?id=${channel._id}`}>
            <RowContent>
              {channel.name}
              <Members>
                {selectedMembers
                  .slice(0, limit ? limit : length)
                  .map(member => this.renderMember(member))}
                {limit &&
                  length - limit > 0 && <More>{`+${length - limit}`}</More>}
              </Members>
            </RowContent>
          </Link>
          <ManageActions>
            <ActionButtons>
              {this.renderEditAction()}
              <Tip text="Delete">
                <Button btnStyle="link" onClick={this.remove} icon="close" />
              </Tip>
            </ActionButtons>
          </ManageActions>
        </Row>
      </SidebarListItem>
    );
  }
}

ChannelRow.propTypes = propTypes;

export default ChannelRow;
