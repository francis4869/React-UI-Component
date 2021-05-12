import React, { useState, useMemo, useRef, PropsWithChildren } from 'react';
import Modal, { ModalProps } from 'antd/lib/modal';
import ConfigProvider from 'antd/lib/config-provider';
import ReactDOM from 'react-dom';
import zhCN from 'antd/lib/locale/zh_CN';

let uuid = 0;

export type ModalType = 'modal' | 'content';

export interface ModalConfig {
  component: React.ReactElement;
  modalProps?: ModalProps;
}

export interface HookModalConfig {
  key?: string;
  component: Function;
  modalProps?: ModalProps;
}

export interface ModalFormValue {
  [key: string]: any;
}

export interface ModalInstance {
  [key: string]: (actionProps?: any) => any;
}

export interface FormModalProps {
  onSubmit: (value: any) => void;
}

/**
 *
 * @param ModalComponent
 * @param modalProps
 */
export const useModal = <T extends ModalInstance>(
  configs: HookModalConfig | HookModalConfig[],
): T => {
  const [initConfig] = useState(configs);

  const res = useMemo(() => {
    const arr = Array.isArray(initConfig) ? initConfig : [initConfig];
    return arr.reduce<any>((acc, item) => {
      acc[item.key || 'open'] = (actionProps?: any, modalProps?: ModalProps) =>
        createModal(
          <item.component {...actionProps} />,
          (item.modalProps || modalProps) && { ...item.modalProps, ...modalProps },
        );
      return acc;
    }, {});
  }, [initConfig]);

  return res;
};

export const useFormModal = <T extends ModalInstance>(
  configs: HookModalConfig | HookModalConfig[],
): T => {
  const [initConfig] = useState(configs);

  const res = useMemo(() => {
    const arr = Array.isArray(initConfig) ? initConfig : [initConfig];
    return arr.reduce<any>((acc, item) => {
      acc[item.key || 'open'] = (actionProps?: any, modalProps?: ModalProps) =>
        createFormModal(
          <item.component {...actionProps} />,
          (item.modalProps || modalProps) && { ...item.modalProps, ...modalProps },
        );
      return acc;
    }, {});
  }, [initConfig]);

  return res;
};

/**
 * 构建Modal
 */
export function createModal<T extends ModalFormValue>(
  component: React.ReactElement,
  modalProps?: ModalProps,
): Promise<T> {
  const { afterClose, ...restModalProps } = modalProps || {};

  return new Promise<any>((resolve, reject) => {
    uuid += 1;

    const removeDom = () => {
      ReactDOM.unmountComponentAtNode(rootEl);
      document.body.removeChild(rootEl);
    };

    const handleSubmit = (value: any) => {
      resolve(value);
    };

    const handleAfterClose = () => {
      removeDom();
      reject();
      afterClose && afterClose();
    };

    const ele = React.cloneElement(component, {
      key: uuid,
      afterClose: handleAfterClose,
      onSubmit: handleSubmit,
      ...restModalProps,
    });

    const modal = <ConfigProvider locale={zhCN}>{ele}</ConfigProvider>;

    const rootEl = document.createElement('div');
    document.body.appendChild(rootEl);
    ReactDOM.render(modal, rootEl);
  });
}

export function createFormModal<T extends ModalFormValue>(
  component: React.ReactElement,
  modalProps?: ModalProps,
): Promise<T> {
  const { afterClose, ...restModalProps } = modalProps || {};

  return new Promise<any>((resolve, reject) => {
    uuid += 1;

    const removeDom = () => {
      ReactDOM.unmountComponentAtNode(rootEl);
      document.body.removeChild(rootEl);
    };

    const handleSubmit = (value: any) => {
      resolve(value);
    };

    const handleAfterClose = () => {
      removeDom();
      reject();
      afterClose && afterClose();
    };

    const ele = React.cloneElement(component, { onSubmit: handleSubmit });

    const modal = (
      <ConfigProvider locale={zhCN}>
        <ModalComponent key={uuid} afterClose={handleAfterClose} {...restModalProps}>
          {ele}
        </ModalComponent>
      </ConfigProvider>
    );

    const rootEl = document.createElement('div');
    document.body.appendChild(rootEl);
    ReactDOM.render(modal, rootEl);
  });
}

/**
 * 弹窗组件
 * @param props
 */
const ModalComponent = (props: ModalProps & PropsWithChildren<any>) => {
  const { onOk, onCancel, children, okButtonProps, ...restProps } = props;

  const [visible, setVisible] = useState(true);

  const [loading, setLoading] = useState(false);

  const contentRef = useRef<any>();

  const realChildren = React.cloneElement(children, { ref: contentRef });

  return (
    <Modal
      visible={visible}
      title="对话框"
      onCancel={e => {
        onCancel && onCancel(e);
        setVisible(false);
      }}
      onOk={async e => {
        setLoading(true);

        const contentInstance = contentRef.current;

        try {
          await (contentInstance?.submit && contentInstance.submit());
          onOk && onOk(e);
          setVisible(false);
        } catch (e) {}

        setLoading(false);
      }}
      okButtonProps={{ loading, ...okButtonProps }}
      {...restProps}
    >
      {realChildren}
    </Modal>
  );
};
