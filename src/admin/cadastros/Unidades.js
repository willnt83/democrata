import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { withStyles } from '@material-ui/core/styles'
import BackEndRequests from '../hocs/BackEndRequests'
import { connect } from 'react-redux'
import axios from "axios"

const { Content } = Layout

const styles = ({
    customFilterDropdown: {
        padding: 8,
        borderRadius: 6,
        background: '#fff',
        boxShadow: '0 1px 6px rgba(0, 0, 0, .2)'
    },
    customFilterDropdownInput: {
        width: 130,
        marginRight: 8
    },
    customFilterDropdownButton: {
        marginRight: 8
    },
    highlight: {
        color: '#f50'
    }
})

const statusOptions = [
    {key: 'ativo', description: 'Ativo'},
    {key: 'inativo', description: 'Inativo'}

]

class Unidades extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Unidades')
    }

    state = {
        tableData: [],
        showUnidadesModal: false,
        inputId: null,
        inputNome: null,
        inputStatus: null,
        selectedRowKeys: [],
        tableLoading: false,
        buttonSalvarUnidade: false,

        loading: false,
        visible: false
        
        


    }

    requestGetUnidades = () => {
        this.setState({tableLoading: true})
        axios
        .get('http://localhost:5000/api/getUnidades')
        .then(res => {
            if(res.data){
                var tableData = res.data.map(unidade => {
                    var status = unidade.status ? 'Ativo' : 'Inativo'
                    return({
                        key: unidade.id,
                        nome: unidade.nome,
                        status: status
                    })
                })
                this.setState({tableData})
            }
            else{
                console.log('Nenhum registro encontrado')
            }
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error);
            this.setState({tableLoading: false})
        })
    }

    requestCreateUpdateUnidade = (request) => {
        this.setState({buttonSalvarUnidade: true})
        axios.post('http://localhost:5000/api/createUpdateUnidade', request)
        .then(res => {
            this.showUnidadesModal(false)
            this.requestGetUnidades()
            this.setState({buttonSalvarUnidade: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarUnidade: false})
        })
    }

    componentWillMount(){
        this.requestGetUnidades()
    }

    componentWillUpdate(nextProps, nextState){
        if(this.state.inputNome !== nextState.inputNome){
            this.props.form.setFieldsValue({
                nome: nextState.inputNome,
                status: nextState.inputStatus
            })
        }
    }

    showUnidadesModal = (showUnidadesModal) => {
        // Se estiver fechando
        if(!showUnidadesModal){
            this.setState({
                inputId: null,
                inputNome: null,
                inputStatus: null
            })
        }

        this.setState({showUnidadesModal})
    }

    loadUnidadesModal = (record) => {
        if(typeof(record) !== "undefined") {
            // Edit
            // Settando os valores da row selecionada nas state variables
            this.setState({
                inputId: record.key,
                inputNome: record.nome,
                inputStatus: record.status
            })
        }
        this.showUnidadesModal(true)
    }

    handleDeleteUnidade = () => {

    }

    handleFormSubmit = (event) => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                this.setState({
                    inputNome: values.nome,
                    inputStatus: values.status
                })

                var id = this.state.inputId ? this.state.inputId : ''
                var status = values.status === 'ativo' ? true : false

                var request = {
                    id: id,
                    nome: values.nome,
                    status: status
                }
                this.requestCreateUpdateUnidade(request)
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    handleSearch = (selectedKeys, confirm) => () => {
        confirm()
        this.setState({ searchText: selectedKeys[0] })
    }

    handleReset = clearFilters => () => {
        clearFilters()
        this.setState({ searchText: '' })
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        })
    }

    render(){
        const { classes } = this.props
        const {selectedRowKeys } = this.state
        const hasSelected = selectedRowKeys.length > 0

        const { getFieldDecorator } = this.props.form;

        const columns = [{
            title: 'ID',
            dataIndex: 'key',
            sorter: (a, b) => a.key - b.key,
        }, {
            title: 'Descrição',
            dataIndex: 'nome',
            sorter: (a, b) => this.compareByAlph(a.description, b.description),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div className={classes.customFilterDropdown}>
                    <Input
                        className={classes.customFilterDropdownInput}
                        ref={ele => this.searchInput = ele}
                        placeholder="Buscar"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={this.handleSearch(selectedKeys, confirm)}
                    />
                    <Button className={classes.customFilterDropdownButton} type="primary" onClick={this.handleSearch(selectedKeys, confirm)}>Buscar</Button>
                    <Button className={classes.customFilterDropdownButton} onClick={this.handleReset(clearFilters)}>Limpar</Button>
                </div>
            ),
            filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
            onFilter: (value, record) => record.description.toLowerCase().includes(value.toLowerCase()),
            onFilterDropdownVisibleChange: (visible) => {
                if (visible) {
                    setTimeout(() => {
                        this.searchInput.focus()
                    })
                }
            },
            render: (text) => {
                const { searchText } = this.state
                return searchText ? (
                    <span>
                        {text.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((fragment, i) => (
                            fragment.toLowerCase() === searchText.toLowerCase()
                            ? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
                        ))}
                    </span>
                ) : text
            }
        }, {
            title: 'Status',
            dataIndex: 'status',
            align: 'center',
            width: 150,
            filters: [{
                text: 'Ativo',
                value: 'Ativo',
            }, {
                text: 'Inativo',
                value: 'Inativo',
            }],
            filterMultiple: false,
            onFilter: (value, record) => record.labelStatus.indexOf(value) === 0
        }, {
            title: 'Operação',
            colSpan: 2,
            dataIndex: 'operacao',
            align: 'center',
            width: 150,
            render: (text, record) => {
                return(
                    <React.Fragment>
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadUnidadesModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteUnidade(record.id)}>
                            <a href="/admin/cadastros/unidades" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
                        </Popconfirm>
                    </React.Fragment>
                )
            }
        }]

        return(
            <Content
                style={{
                    margin: "24px 16px",
                    padding: 24,
                    background: "#fff",
                    minHeight: 280
                }}
            >

                <Row style={{ marginBottom: 16 }}>
                    <Col span={24} align="end">
                        <Tooltip title="Cadastrar Nova Unidade" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadUnidadesModal()}><Icon type="plus" /> Nova Unidade</Button>
                            </Tooltip>
                            <span style={{ marginLeft: 8 }}>
                                {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
                            </span>
                            </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Unidade"
                    visible={this.state.showUnidadesModal}
                    onCancel={() => this.showUnidadesModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showUnidadesModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarUnidade} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Form layout="vertical">
                        <Form.Item
                            label="Nome"
                        >
                            {getFieldDecorator('nome', {
                                rules: [
                                    {
                                        required: true, message: 'Por favor informe o nome da unidade',
                                    }
                                ]
                            })(
                                <Input
                                    id="nome"
                                    placeholder="Digite o nome da unidade"
                                />
                            )}
                        </Form.Item>
                        <Form.Item label="Status">
                            {getFieldDecorator('status')(
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Selecione"
                                >
                                    {
                                        statusOptions.map((option) => {
                                            return (<Select.Option key={option.key}>{option.description}</Select.Option>)
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
          </Content>
        )
    }
}

const MapStateToProps = (state) => {
	return {
	}
}
const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(BackEndRequests(withStyles(styles)(Form.create()(Unidades))))