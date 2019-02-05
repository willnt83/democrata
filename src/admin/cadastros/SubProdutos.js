import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Divider } from 'antd'
import { TextField, MenuItem, Tooltip } from '@material-ui/core/'
import ButtonUI from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import { withStyles } from '@material-ui/core/styles'
import BackEndRequests from '../hocs/BackEndRequests'
import { connect } from 'react-redux'

const { Content } = Layout
const statusOptions = [{
    value: true,
    label: 'Ativo'
},
{
    value: false,
    label: 'Inativo'
}];

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

const dataTable = [
    {id: 1, description: 'Sofá Cartagena', status: 'Ativo'},
    {id: 2, description: 'Cama Box Modelo A', status: 'Ativo'},
    {id: 3, description: 'Mesa MDF Modelo B', status: 'Ativo'},
    {id: 4, description: 'Banco MDF Modelo C', status: 'Inativo'}
]

const componentes = [
    {id: 1, description: 'Braço', status: 'Ativo'},
    {id: 2, description: 'Assento Comum', status: 'Ativo'},
    {id: 3, description: 'Assento Quadrado', status: 'Ativo'},
    {id: 4, description: 'Assento Chaise', status: 'Inativo'},
    {id: 5, description: 'Encosto Maior', status: 'Ativo'},
    {id: 6, description: 'Encosto Menor', status: 'Ativo'},
    {id: 7, description: 'Base Maior', status: 'Ativo'},
    {id: 8, description: 'Base Menor', status: 'Ativo'},
    {id: 9, description: 'Almofada Quadrada', status: 'Ativo'},
    {id: 10, description: 'Almofada Bico Grande', status: 'Ativo'},
    {id: 11, description: 'Almofada Bico Pequeno', status: 'Ativo'}
]

class SubProdutos extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Sub-produtos')
    }

    state = {
        selectedRowKeys: [], // Check here to configure the default column
        loading: false,
        visible: false,
        buttonConfirmHabilidadeState: false,
        tableLoading: false,
        inId: '',
        inDescricao: '',
        inStatus: true,
        searchText: ''
    }


    showHabilidadesModal = (rowId) => {
        if(typeof(rowId) == "undefined") {
            // Create
            this.setState({
                inId: '',
                inDescricao: '',
                inStatus: true
            })
        }
        else {
            // Edit
            this.setState({
                inId: this.props.habilidades[rowId].id,
                inDescricao: this.props.habilidades[rowId].description,
                inStatus: this.props.habilidades[rowId].valueStatus
            })
        }

        this.setState({
            visible: true
        });
    }

    hideHabilidadesModal = () => {
		this.setState({
			visible: false
		});
    }
    


    handleCancel = () => {
        this.setState({
            visible: false,
        });
    }

    handleFormInput = (event) => {
		const target = event.target;
		
		this.setState({
			[target.name]: target.value
        });
    }
    
    handleDeleteHabilidade = (id) => {
        this.props.deleteHabilidade(id)
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1;
        if (a < b)
            return 1;
        return 0;
    }

    handleSearch = (selectedKeys, confirm) => () => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
    }

    handleReset = clearFilters => () => {
        clearFilters();
        this.setState({ searchText: '' });
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    render(){
        const { classes } = this.props;
        const {selectedRowKeys, visible, buttonConfirmHabilidadeState } = this.state;
        const hasSelected = selectedRowKeys.length > 0;

        const columns = [{
            title: 'ID',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
        }, {
            title: 'Descrição',
            dataIndex: 'description',
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
                        this.searchInput.focus();
                    });
                }
            },
            render: (text) => {
                const { searchText } = this.state;
                return searchText ? (
                    <span>
                        {text.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((fragment, i) => (
                            fragment.toLowerCase() === searchText.toLowerCase()
                            ? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
                        ))}
                    </span>
                ) : text;
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
                        <Icon type="edit" style={{cursor: 'pointer'}}onClick={() => this.showHabilidadesModal(record.key)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteHabilidade(record.id)}>
                            <a href="/admin/cadastros/habilidades" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
                        </Popconfirm>
                    </React.Fragment>
                );
            }
        }];

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
                        <Tooltip title="Cadastrar Produto" placement="right">
                            <ButtonUI 
                                variant="fab" 
                                aria-label="Add" 
                                onClick={() => this.showHabilidadesModal()}
                                style={{backgroundColor: '#228B22', color: '#fff'}}>
                                <AddIcon />
                            </ButtonUI>
                            </Tooltip>
                            <span style={{ marginLeft: 8 }}>
                                {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
                            </span>
                            </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={dataTable}
                />
                <Modal
                    title="Cadastro de Produto"
                    visible={visible}
                    onCancel={this.handleCancel}
                    width={700}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>Cancelar</Button>,
                        <Button key="submit" type="primary" loading={buttonConfirmHabilidadeState} onClick={this.handleCreateUpdateHabilidade}>
                            Confirmar
                        </Button>
                    ]}
                >
                    <TextField
                        id="descricao"
                        name="inDescricao"
                        value={this.state.inDescricao}
                        label="Descrição"
                        placeholder='Descrição'
                        fullWidth={true}
                        onChange={this.handleFormInput}
                        required
                    />
                    <TextField
                        id="status"
                        select
                        label="Status"
                        fullWidth={true}
                        className={classes.textField}
                        value={this.state.inStatus}
                        onChange={this.handleChange('inStatus')}
                        InputLabelProps={{ shrink: true }}
                        SelectProps={{
                            MenuProps: {
                                className: classes.menu,
                            },
                        }}
                        margin="normal"
                    >
                        {
                            statusOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))
                        }
                    </TextField>
                    <Divider />
                    <Row>
                        <Col span={24}>
                            <h3>Composição</h3>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={22}>
                            <TextField
                                select
                                fullWidth={true}
                                placeholder="Selecione o componente"
                                value={1}
                            >
                                {
                                    componentes.map(option => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.description}
                                        </MenuItem>
                                    ))
                                }
                            </TextField>
                        </Col>
                        <Col span={2}>
                        <TextField
                                fullWidth={true}
                            >
                            </TextField>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={22}>
                            <TextField
                                select
                                fullWidth={true}
                                placeholder="Selecione o componente"
                                value={2}
                            >
                                {
                                    componentes.map(option => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.description}
                                        </MenuItem>
                                    ))
                                }
                            </TextField>
                        </Col>
                        <Col span={2}>
                        <TextField
                                fullWidth={true}
                            >
                            </TextField>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={22}>
                            <TextField
                                select
                                fullWidth={true}
                                placeholder="Selecione o componente"
                                value={3}
                            >
                                {
                                    componentes.map(option => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.description}
                                        </MenuItem>
                                    ))
                                }
                            </TextField>
                        </Col>
                        <Col span={2}>
                        <TextField
                                fullWidth={true}
                            >
                            </TextField>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={22}>
                            <TextField
                                select
                                fullWidth={true}
                                placeholder="Selecione o componente"
                                value={4}
                            >
                                {
                                    componentes.map(option => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.description}
                                        </MenuItem>
                                    ))
                                }
                            </TextField>
                        </Col>
                        <Col span={2}>
                        <TextField
                                fullWidth={true}
                            >
                            </TextField>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={22}>
                            <TextField
                                select
                                fullWidth={true}
                                placeholder="Selecione o componente"
                                value={5}
                            >
                                {
                                    componentes.map(option => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.description}
                                        </MenuItem>
                                    ))
                                }
                            </TextField>
                        </Col>
                        <Col span={2}>
                        <TextField
                                fullWidth={true}
                            >
                            </TextField>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={22}>
                            <TextField
                                select
                                fullWidth={true}
                                placeholder="Selecione o componente"
                                value={6}
                            >
                                {
                                    componentes.map(option => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.description}
                                        </MenuItem>
                                    ))
                                }
                            </TextField>
                        </Col>
                        <Col span={2}>
                        <TextField
                                fullWidth={true}
                            >
                            </TextField>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={22}>
                            <TextField
                                select
                                fullWidth={true}
                                placeholder="Selecione o componente"
                                value={7}
                            >
                                {
                                    componentes.map(option => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.description}
                                        </MenuItem>
                                    ))
                                }
                            </TextField>
                        </Col>
                        <Col span={2}>
                        <TextField
                                fullWidth={true}
                            >
                            </TextField>
                        </Col>
                    </Row>
                    <Row gutter={16} style={{marginTop: 10}}>
                        <Col span={22}>
                            <Icon type="plus" />
                        </Col>
                    </Row>
                </Modal>
          </Content>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        habilidades: state.habilidades
	}
}
const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(BackEndRequests(withStyles(styles)(SubProdutos)));