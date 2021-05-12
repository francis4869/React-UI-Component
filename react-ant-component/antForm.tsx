import React, { ReactNode } from 'react';
import {
  Button,
  Checkbox,
  DatePicker,
  DatePickerProps,
  Form,
  FormItemProps,
  Input,
  InputNumber,
  InputNumberProps,
  InputProps,
  Radio,
  RadioProps,
  Switch,
  SwitchProps,
  Upload,
  UploadProps,
} from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import { CheckboxGroupProps, CheckboxOptionType } from 'antd/lib/checkbox';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { RangePickerProps } from 'antd/es/date-picker/generatePicker';
import { UploadOutlined } from '@ant-design/icons';
import { FormProps, Rule } from 'antd/lib/form';
import { FormInstance } from 'antd/es/form';

const CheckboxGroup = Checkbox.Group;

interface CommonProps extends FormItemProps {
  required?: boolean;
  message?: string;
  name: string;
}

interface FormShellProps extends CommonProps {
  children: ReactNode;
}

export const FormShell = ({
  required = true,
  message = '请输入',
  children,
  ...restProps
}: FormShellProps) => (
  <Form.Item rules={[{ required, message }]} {...restProps}>
    {children}
  </Form.Item>
);

interface FormInputProps extends CommonProps {
  config?: InputProps;
}

export const FormInput = ({ config, ...restProps }: FormInputProps) => (
  <FormShell {...restProps}>
    <Input {...config} />
  </FormShell>
);

interface FormInputNumberProps extends CommonProps {
  config?: InputNumberProps;
}

export const FormInputNumber = ({
  config,
  ...restProps
}: FormInputNumberProps) => (
  <FormShell {...restProps}>
    <InputNumber {...config} />
  </FormShell>
);

interface FormTextAreaProps extends CommonProps {
  config?: TextAreaProps;
}

export const FormTextArea = ({ config, ...restProps }: FormTextAreaProps) => (
  <FormShell {...restProps}>
    <Input.TextArea {...config} />
  </FormShell>
);

interface FormRadioProps extends CommonProps {
  config?: RadioProps;
  children: RadioNodeList;
}

export const FormRadio = ({
  children,
  config,
  ...restProps
}: FormRadioProps) => (
  <FormShell {...restProps}>
    <Radio.Group {...config}>{children}</Radio.Group>
  </FormShell>
);

interface FormDatePickerProps extends CommonProps {
  config?: DatePickerProps;
}

export const FormDatePicker = ({
  config,
  ...restProps
}: FormDatePickerProps) => (
  <FormShell {...restProps}>
    <DatePicker {...config} />
  </FormShell>
);

interface FormRangePickerProps extends CommonProps {
  config?: RangePickerProps<moment.Moment>;
}

export const FormRangePicker = ({
  config,
  ...restProps
}: FormRangePickerProps) => (
  <FormShell {...restProps}>
    <DatePicker.RangePicker {...config} />
  </FormShell>
);

interface FormSwitchProps extends CommonProps {
  config?: SwitchProps;
}

export const FormSwitch = ({ config, ...restProps }: FormSwitchProps) => (
  <FormShell {...restProps}>
    <Switch {...config} />
  </FormShell>
);

interface FormUploadProps extends CommonProps {
  config?: UploadProps;
  title?: string;
}

export const FormUpload = ({
  config,
  title,
  ...restProps
}: FormUploadProps) => (
  <FormShell {...restProps}>
    <Upload {...config}>
      <Button icon={<UploadOutlined />}>{title || '点击上传'}</Button>
    </Upload>
  </FormShell>
);

interface FormCheckBoxProps extends CommonProps {
  config?: CheckboxGroupProps;
  options: (string | CheckboxOptionType)[];
  showCheckAll?: boolean;
}

export const FormCheckBox = ({
  config,
  showCheckAll = false,
  options,
  ...restProps
}: FormCheckBoxProps) => {
  const [checkedList, setCheckedList] = React.useState(options || []);
  const [indeterminate, setIndeterminate] = React.useState(true);
  const [checkAll, setCheckAll] = React.useState(false);

  const onCheckAllChange = (e: {
    target: { checked: boolean | ((prevState: boolean) => boolean) };
  }) => {
    setCheckedList(e.target.checked ? options : []);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  const onChange = (list: (any | CheckboxOptionType)[]) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < options.length);
    setCheckAll(list.length === options.length);
  };

  return (
    <FormShell {...restProps}>
      {showCheckAll ? (
        <>
          <Checkbox
            indeterminate={indeterminate}
            onChange={onCheckAllChange}
            checked={checkAll}
          >
            全选
          </Checkbox>
          <CheckboxGroup
            options={options}
            onChange={li => onChange(li)}
            value={checkedList as CheckboxValueType[]}
            {...config}
          />
        </>
      ) : (
        <CheckboxGroup options={options} {...config} />
      )}
    </FormShell>
  );
};

export interface FormRefEleProps extends FormProps {
  onSubmit?: (value: any) => Promise<any>;
  Children: FormInstance;
}

export const FormRefEle = React.forwardRef((props: FormRefEleProps, ref) => {
  const [form] = Form.useForm();
  const { onSubmit, Children, ...restProps } = props;

  React.useImperativeHandle(ref, () => ({
    submit: () =>
      form.validateFields().then(data => {
        onSubmit && onSubmit(data);
      }),
  }));

  return (
    <Form layout="vertical" {...restProps} form={form}>
      {Children}
    </Form>
  );
});

const Test = () => {
  React.useEffect(() => {
    console.log('launch');
  }, []);

  return (
    <div style={{ padding: '40px' }}>
      <Form>
        <FormInput name="app" label="app"  />

        <Button htmlType="submit">submit</Button>
      </Form>
    </div>
  );
};

export default Test;
