import 'grapesjs/dist/css/grapes.min.css';

import { IPageDoc } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import { List } from './styles';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  siteId?: string;
  pages: IPageDoc[];
  pageId: string;
  onLoad: (isLoading?: boolean) => void;
  handleItemSettings: (item: any, type: string) => void;
};

class PageList extends React.Component<Props> {
  render() {
    const {
      pages,
      handleItemSettings,
      siteId = '',
      pageId,
      onLoad
    } = this.props;

    return (
      <List>
        {pages.map(page => {
          const isActive = pageId === page._id;

          return (
            <li key={page._id} onClick={() => onLoad(true)}>
              <Link
                className={isActive ? 'active' : ''}
                to={`/xbuilder/sites/edit/${siteId}?pageId=${page._id}`}
              >
                <Icon icon="file-1" />
                {page.name}
              </Link>
              {isActive && (
                <Icon
                  icon="settings"
                  onClick={() => handleItemSettings(page, 'page')}
                />
              )}
            </li>
          );
        })}
        <li
          className="link"
          onClick={() =>
            handleItemSettings({ name: '', description: '' }, 'page')
          }
        >
          <div>
            <Icon icon="plus-1" /> &nbsp;
            {__('Create page')}
          </div>
        </li>
      </List>
    );
  }
}

export default PageList;
