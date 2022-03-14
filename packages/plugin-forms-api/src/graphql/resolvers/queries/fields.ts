import {
  checkPermission,
  requireLogin,
} from "@erxes/api-utils/src/permissions";
import { fieldsCombinedByContentType } from "../../../utils";
import { serviceDiscovery } from "../../../configs";
import { fetchService } from "../../../messageBroker";
import { IContext } from "../../../connectionResolver";
interface IFieldsDefaultColmns {
  [index: number]: { name: string; label: string; order: number } | {};
}

export interface IFieldsQuery {
  contentType: string;
  contentTypeId?: string;
  isVisible?: boolean;
  isDefinedByErxes?: boolean;
}

const fieldQueries = {
  async fieldsGetTypes() {
    const services = await serviceDiscovery.getServices();
    const fieldTypes: Array<{ description: string; contentType: string }> = [];

    for (const serviceName of services) {
      const service = await serviceDiscovery.getService(serviceName, true);
      const meta = service.config.meta || {};

      if (meta && meta.forms) {
        const types = meta.forms.types || [];

        for (const type of types) {
          fieldTypes.push({
            description: type.description,
            contentType: `${serviceName}:${type.type}`,
          });
        }
      }
    }

    return fieldTypes;
  },

  /**
   * Fields list
   */
  fields(
    _root,
    {
      contentType,
      contentTypeId,
      isVisible,
    }: { contentType: string; contentTypeId: string; isVisible: boolean },
    { models }: IContext
  ) {
    const query: IFieldsQuery = { contentType };

    if (contentTypeId) {
      query.contentTypeId = contentTypeId;
    }

    if (isVisible) {
      query.isVisible = isVisible;
    }

    return models.Fields.find(query).sort({ order: 1 });
  },

  /**
   * Generates all field choices base on given kind.
   */
  async fieldsCombinedByContentType(_root, args, { models }: IContext) {
    return fieldsCombinedByContentType(models, args);
  },

  /**
   * Default list columns config
   */
  async fieldsDefaultColumnsConfig(
    _root,
    { contentType }: { contentType: string }
  ): Promise<IFieldsDefaultColmns> {
    const [serviceName, type] = contentType.split(":");
    const service = await serviceDiscovery.getService(serviceName, true);

    if (!service) {
      return [];
    }

    const meta = service.config.meta || {};

    if (meta.forms && meta.forms.defaultColumnsConfig) {
      return meta.forms.defaultColumnsConfig[type] || [];
    }

    return [];
  },

  // ? async fieldsInbox(_root) {
  //   const response: {
  //     customer?: IFieldDocument[];
  //     conversation?: IFieldDocument[];
  //     device?: IFieldDocument[];
  //   } = {};

  //   const customerGroup = await FieldsGroups.findOne({
  //     contentType: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER,
  //     isDefinedByErxes: true
  //   });

  //   if (customerGroup) {
  //     response.customer = await Fields.find({ groupId: customerGroup._id });
  //   }

  //   const converstionGroup = await FieldsGroups.findOne({
  //     contentType: FIELDS_GROUPS_CONTENT_TYPES.CONVERSATION,
  //     isDefinedByErxes: true
  //   });

  //   if (converstionGroup) {
  //     response.conversation = await Fields.find({
  //       groupId: converstionGroup._id
  //     });
  //   }

  //   const deviceGroup = await FieldsGroups.findOne({
  //     contentType: FIELDS_GROUPS_CONTENT_TYPES.DEVICE,
  //     isDefinedByErxes: true
  //   });

  //   if (deviceGroup) {
  //     response.device = await Fields.find({ groupId: deviceGroup._id });
  //   }

  //   return response;
  // },

  // async fieldsItemTyped(_root) {
  //   const result = {};

  //   for (const ct of ['deal', 'ticket', 'task']) {
  //     result[ct] = [];

  //     const groups = await FieldsGroups.find({ contentType: ct });

  //     for (const group of groups) {
  //       const fields = await Fields.find({ groupId: group._id });
  //       const pipelines = await Pipelines.find({
  //         _id: { $in: group.pipelineIds || [] }
  //       });

  //       for (const pipeline of pipelines) {
  //         const board = await Boards.getBoard(pipeline.boardId);

  //         for (const field of fields) {
  //           result[ct].push({
  //             boardName: board.name,
  //             pipelineName: pipeline.name,
  //             fieldId: field._id,
  //             fieldName: field.text
  //           });
  //         }
  //       }
  //     }
  //   }

  //   return result;
  // }
};

requireLogin(fieldQueries, "fieldsCombinedByContentType");
requireLogin(fieldQueries, "fieldsDefaultColumnsConfig");
requireLogin(fieldQueries, "fieldsItemTyped");

checkPermission(fieldQueries, "fields", "showForms", []);

const fieldsGroupQueries = {
  /**
   * Fields group list
   */
  async fieldsGroups(
    _root,
    {
      contentType,
      isDefinedByErxes,
      config,
    }: {
      contentType: string;
      isDefinedByErxes: boolean;
      config;
    },
    { commonQuerySelector, models }: IContext
  ) {
    let query: any = commonQuerySelector;

    // querying by content type
    query.contentType = contentType;

    if (config) {
      query = await fetchService(
        contentType,
        "groupsFilter",
        { config, contentType },
        query
      );
    }

    if (isDefinedByErxes !== undefined) {
      query.isDefinedByErxes = isDefinedByErxes;
    }

    const groups = await models.FieldsGroups.find(query);

    return groups
      .map((group) => {
        if (group.isDefinedByErxes) {
          group.order = -1;
        }
        return group;
      })
      .sort((a, b) => {
        if (a.order && b.order) {
          return a.order - b.order;
        }
        return -1;
      });
  },

  getSystemFieldsGroup(
    _root,
    { contentType }: { contentType: string },
    { models }: IContext
  ) {
    const query: any = {};

    // querying by content type
    query.contentType = contentType;
    query.isDefinedByErxes = true;

    return models.FieldsGroups.findOne(query);
  },
};

checkPermission(fieldsGroupQueries, "fieldsGroups", "showForms", []);

export { fieldQueries, fieldsGroupQueries };
