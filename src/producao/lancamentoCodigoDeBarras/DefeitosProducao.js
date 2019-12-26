import React, { Component } from 'react'
import { Row, Col, Form, Modal, Icon, Button, Divider, Table, Input, InputNumber, Tag, Popconfirm } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import BarcodeReader from 'react-barcode-reader'

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends Component {
    state = {
        editing: false,
    };

    toggleEdit = () => {
        const editing = !this.state.editing;
        this.setState({ editing }, () => {
        if (editing) {
            this.input.focus();
        }
        });
    };

    save = e => {
        const { record, handleSave } = this.props;
        this.form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return;
            }
            this.toggleEdit();
            handleSave({ ...record, ...values });
        });
    };

    renderCell = form => {
        this.form = form;
        const { children, dataIndex, record, errorMessage } = this.props;
        const { editing } = this.state;
        return editing ? (
        <Form.Item style={{ margin: 0 }}>
            {form.getFieldDecorator(dataIndex, {
            rules: [
                {
                required: true,
                message: errorMessage,
                },
            ],
            initialValue: record[dataIndex],
            })(<InputNumber 
                    ref={node => (this.input = node)} 
                    onPressEnter={this.save} 
                    onBlur={this.save} 
                    min={0} 
                    max={9999999}
                />)}
        </Form.Item>
        ) : (
        <div
            style={{ paddingRight: 24 }}
            onClick={this.toggleEdit}
        >
            {children}
        </div>
        );
    };

    render() {
        const {
        editable,
        dataIndex,
        title,
        errorMessage,
        record,
        index,
        handleSave,
        children,
        ...restProps
        } = this.props;
        return (
        <td {...restProps}>
            {editable ? (
            <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
            ) : (
            children
            )}
        </td>
        );
    }
}

class DefeitosProducao extends Component{
    constructor(props){
        super(props)

        this.columns = [{
            title: 'ID',
            dataIndex: 'id',
            sorter: (a, b) => a.key - b.key,
        },
        {
            title: 'Produção',
            dataIndex: 'producao.nome',
            sorter: (a, b) => this.compareByAlph(a.producao.nome, b.producao.nome)
        },
        {
            title: 'Produto',
            dataIndex: 'produto.nome',
            sorter: (a, b) => this.compareByAlph(a.produto.nome, b.produto.nome)
        },
        {
            title: 'Cor',
            dataIndex: 'produto.cor',
            sorter: (a, b) => this.compareByAlph(a.produto.cor, b.produto.cor)
        },
        {
            title: 'Conjunto',
            dataIndex: 'conjunto.nome',
            sorter: (a, b) => this.compareByAlph(a.conjunto.nome, b.conjunto.nome)
        },
        {
            title: 'Setor',
            dataIndex: 'setor.nome',
            sorter: (a, b) => this.compareByAlph(a.setor.nome, b.setor.nome)
        },
        {
            title: 'Subproduto',
            dataIndex: 'subproduto.nome',
            sorter: (a, b) => this.compareByAlph(a.subproduto.nome, b.subproduto.nome)
        },
        {
            title: 'Funcionário',
            dataIndex: 'funcionario.nome',
            sorter: (a, b) => this.compareByAlph(a.funcionario.nome, b.funcionario.nome)
        },
        {
            title: 'Quantidade',
            dataIndex: 'quantidade',
            errorMessage: 'Quantidade é obrigatória.',
            editable: true,
            sorter: (a, b) => this.compareByAlph(a.quantidade, b.quantidade)
        },
        {
            title: 'Operacao',
            dataIndex: 'operacao',
            render: (text, record) =>
            this.state.tableData.length >= 1 ? (
                <Popconfirm title="Tem certeza que deseja remover o código de barras do lançamento?" onConfirm={() => this.handleDelete(record.id)}>
                    <Tag color="volcano" style={{cursor: 'pointer'}}>x Remover</Tag>
                </Popconfirm>
            ) : null,
        }]

        this.state = {
            mostrar: false,
            subprodutosOptions: [],
            tableData: [],
            tableKeys: [],
            barcodeReader: false,
            lancamentoManual: false,
            btnLancarLoading: false,
            btnSalvarLoading: false
        }
        this.handleScanCodigoDeBarras = this.handleScanCodigoDeBarras.bind(this)
    }

    handleScanCodigoDeBarras(data){
        if(data)
            this.requestGetCodigoDeBarra(data)
        else
            this.props.showNotification('Erro ao realizar a leitura. Tente novamente', false)
    }

    lancamentoManual = (bool) => {
        this.setState({lancamentoManual: bool})
    }

    handleError(err){
        console.error(err)
    }

    requestGetCodigoDeBarra = (barcode) => {
        this.setState({btnLancarLoading: true})
        axios
        .get(this.props.backEndPoint    + '/getCodigoDeBarra?barcode='+barcode )
        .then(res => {
            if(res.data.success){
                let barcodeData = res.data.payload
                let tableData   = this.state.tableData
                let tableKeys   = this.state.tableKeys
                if(barcodeData) {
                    if(barcodeData.codigoDeBarras.lancado !== 'S'){
                        this.props.showNotification('Código de Barras ainda não lançado.', false)
                    } else {
                        if(tableKeys.indexOf(barcodeData.id) === -1) {
                            if(!barcodeData.codigoDeBarras.qtdeDefeito || barcodeData.codigoDeBarras.qtdeDefeito <= 0)
                                barcodeData.quantidade = 1
                            else
                                barcodeData.quantidade = barcodeData.codigoDeBarras.qtdeDefeito
                            tableData.push(barcodeData)
                            tableKeys.push(barcodeData.id)
                            this.setState({tableData, tableKeys})
                        } else {
                            this.props.showNotification('Código de Barras já inserido.', false)
                        }
                    }
                } else {
                    this.props.showNotification('Código de Barras não existente', false)
                }
            } else {
                this.props.showNotification(res.data.msg, false)
            }
            this.setState({btnLancarLoading: false})
        })
        .catch(error => {
            this.setState({btnLancarLoading: false})
            console.log(error)
        })
    }

    requestDefeitosProducao = (request) => {
        this.setState({btnSalvarLoading: true})
        axios
        .post(this.props.backEndPoint + '/defeitoCodigoDeBarras', request)
        .then(res => {
            if(res.data.success){
                this.props.showNotification(res.data.msg, res.data.success)
                this.closeModal()
            }
            else{
                this.props.showNotification(res.data.msg, res.data.success)
            }
            this.setState({btnSalvarLoading: false})
        })
        .catch(error => {
            this.setState({btnSalvarLoading: false})
            console.log(error)
        })
    }   

    handleLancamento = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                this.requestGetCodigoDeBarra(values.codigoDeBarras)
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    handleSave = row => {
        let newData = [...this.state.tableData];
        let index = newData.findIndex(item => row.id === item.id);
        let item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        this.setState({ tableData: newData });
    }

    handleDelete = id => {
        let tableData = this.state.tableData
        let tableKeys = this.state.tableKeys
        tableData = tableData.filter(item => item.id !== id)
        tableKeys.splice(tableKeys.indexOf(id), 1)
        this.setState({tableData, tableKeys});
    }

    saveBarcodes = () => {
        let tableData = this.state.tableData;
            if(tableData && tableData.length > 0) {
            let requestData = tableData.map(record => {
                return {
                    id: record.id,
                    quantidade: record.quantidade
                }
            })
            this.requestDefeitosProducao(requestData)
        } else {
            this.props.showNotification('Não há registro válido para inserir.', false)
        }
    }

    alterarProducao = () => {
        this.setState({
            tableData: [],
            tableKeys: []
        })
    }

    closeModal = () => {
        this.setState({
            barcodeReader: false,
            tableData: [],
            tableKeys: []
        })
        this.props.showModalDefeitosProducaoF(false)
    }

    componentWillReceiveProps(nextProps){
        if(!this.props.showModalDefeitosProducao && nextProps.showModalDefeitosProducao){
            this.setState({barcodeReader: true})
        }
    }

    render(){
        const { getFieldDecorator } = this.props.form

        const components = {
            body: {
              row: EditableFormRow,
              cell: EditableCell,
            }
        };

        const columns = this.columns.map(col => {
            if (!col.editable) {
              return col;
            }
            return {
              ...col,
              onCell: record => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                errorMessage: col.errorMessage,
                handleSave: this.handleSave,
              }),
            };
          }); 

        const inputLancamentoManual =
            <React.Fragment>
                <Form.Item label="Código de Barras" style={{marginBottom: '0px'}}>
                    {getFieldDecorator('codigoDeBarras', {
                        rules: [
                            {
                                required: true, message: 'Por favor informe o código de barras',
                            }
                        ]
                    })(
                        <Input
                            id="codigoDeBarras"
                            placeholder="Digite o código de barras"
                        />
                    )}
                </Form.Item>
                <Button key="submit" type="primary" onClick={this.handleLancamento} loading={this.state.btnLancarLoading}><Icon type="save" /> Lançar</Button>
            </React.Fragment>

        return(
            <Modal
                title="Defeitos de Produção"
                visible={this.props.showModalDefeitosProducao}
                onCancel={this.closeModal}
                footer={[
                    <Popconfirm title="Deseja salvar os códigos de barras?" onConfirm={() => this.saveBarcodes()}>
                        <Button className="buttonGreen" loading={this.state.btnSalvarLoading}><Icon type="check" /> Salvar</Button>
                    </Popconfirm>,
                    <Popconfirm title="Deseja fechar? Todos as alterações serão perdidas" onConfirm={this.closeModal}>
                        <Button type="primary" key="back"><Icon type="close" /> Fechar</Button>
                    </Popconfirm>
                ]}
                width={1200}
            >
                <Row>
                    <Col span={24} id="colDefeitosProducao" style={{position: 'relative'}}>
                        {
                            this.state.barcodeReader ?
                            <BarcodeReader
                                onError={this.handleError}
                                onScan={this.handleScanCodigoDeBarras}
                            />
                            :null
                        }
                        <Form layout="vertical">
                            <Row style={{marginBottom: 10}}>
                                {
                                    !this.state.lancamentoManual ?
                                    <Col span={24} onClick={() => this.lancamentoManual(true)} style={{textAlign: 'right', cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>
                                        <span className="bold" onClick={this.habilitarLancamentoManual} style={{cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>Lançamento Manual</span>
                                    </Col>
                                    :
                                    <Col span={24} onClick={() => this.lancamentoManual(false)} style={{textAlign: 'right', cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>
                                        <span className="bold" onClick={this.habilitarLancamentoManual} style={{cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>Código de Barras</span>
                                    </Col>
                                }
                            </Row>
                            <Row>
                                {
                                    !this.state.lancamentoManual ?
                                    <Col span={24}><span className="bold">Aguardando leitura do código de barras do produto...</span></Col>
                                    :
                                    <Col span={24}>
                                        {inputLancamentoManual}
                                    </Col>
                                }
                            </Row>
                        </Form> 
                        <Divider />
                        {
                            this.state.tableData.length > 0 ?
                            <Table
                                components={components}
                                bordered
                                dataSource={this.state.tableData}
                                columns={columns}
                                rowKey='id'
                                pagination={false}
                            />
                            : null
                        }
                    </Col>
                </Row>
            </Modal>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint,
        producaoAcompanhamento: state.producaoAcompanhamento,
        producaoMainData: state.producaoMainData
	}
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(DefeitosProducao)))