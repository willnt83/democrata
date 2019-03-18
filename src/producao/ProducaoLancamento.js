import React, { Component } from 'react'
import { Row, Col, Form, Input, notification, Icon, DatePicker, Button } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'
moment.locale('pt-br')

class ProducaoLancamento extends Component{
    state = {
        dataProducao: null,
        tryToSetValues: true
    }

    requestGetProducaoAcompanhamento = (id) => {
        var filter = id !== null ? '?id_setor='+id : ''
        axios
        .get(this.props.backEndPoint + '/getProducaoAcompanhamento'+filter)
        .then(res => {
            if(res.data.payload){
                // Tabs
                this.setState({
                    tabs: res.data.payload.map(setor => {
                        return({
                            key: setor.id,
                            description: setor.nome
                        })
                    })
                })
                this.props.setProducaoAcompanhamento(res.data.payload)

            }
            else
                console.log('Nenhum registro encontrado')

        })
        .catch(error => {
            console.log(error)
        })
    }

    requestUpdateRealizadoQuantidade = (request) => {
        axios
        .post(this.props.backEndPoint + '/updateRealizadoQuantidade', request)
        .then(res => {
            if(res.data.success){
                this.requestGetProducaoAcompanhamento(this.props.session.perfil.idSetor)
                this.showNotification(res.data.msg, true)
            }
            else{
                this.showNotification(res.data.msg, false)
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    showNotification = (msg, success) => {
        console.log('message', msg)
        var type = null
        var style = null
        if(success){
            type = 'check-circle'
            style = {color: '#4ac955', fontWeight: '800'}
        }
        else {
            type = 'exclamation-circle'
            style = {color: '#f5222d', fontWeight: '800'}
        }
        const args = {
            messasge: 'AA',
            icon:  <Icon type={type} style={style} />,
            duration: 3
        }
        notification.open(args)
    }

    setRealizadoQuantidadeValues = () => {
        var aux = []
        this.props.producaoAcompanhamento
        .map(setor => {
            return(
                setor.producoes.filter(producao => {
                    return(producao.dataInicial === this.state.dataProducao)
                })
                .map(producao => {
                    return(
                        producao.produtos.map(produto => {
                            return(
                                produto.subprodutos.map(subprodutos => {
                                    aux.push({
                                        id: subprodutos.idAcompanhamento,
                                        realizadoQuantidade: subprodutos.realizadoQuantidade
                                    })
                                    return({
                                        id: subprodutos.idAcompanhamento,
                                        realizadoQuantidade: subprodutos.realizadoQuantidade
                                    })
                                })
                            )
                        })
                    )
                })
            )
        })
        var strObj = '{'
        var comma = ''
        aux.forEach((item, index) => {
            comma = index === 0 ? '' : ', '
            strObj += comma+'"realizadoQuantidade_'+item.id+'": "'+item.realizadoQuantidade+'"'
        })
        strObj += '}'
        var obj  = JSON.parse(strObj)
        this.props.form.setFieldsValue(obj)
    }

    handleChangeDataProducao = (value) => {
        this.setState({dataProducao: value.format('YYYY-MM-DD'), tryToSetValues: true})
    }

    handleChangeQuantidadeRealizado = (element) => {
        if(element.target.value !== ''){
            var idAcompanhamento = element.target.id.replace('realizadoQuantidade_', '')

            var request = {
                idAcompanhamento: parseInt(idAcompanhamento),
                realizadoQuantidade: parseInt(element.target.value)
            }
            this.requestUpdateRealizadoQuantidade(request)
        }
    }

    handleQuantityChangeClick = (op, id) => {
        console.log('op', op)
        var value =  this.props.form.getFieldValue(id)
        if(op === 'sub'){
            value--
        }
        else{
            value++
        }
        var strObj = '{"'+id+'": '+value+'}';
        var obj  = JSON.parse(strObj)
        this.props.form.setFieldsValue(obj)

        var idAcompanhamento = id.replace('realizadoQuantidade_', '')
        var request = {
            idAcompanhamento: parseInt(idAcompanhamento),
            realizadoQuantidade: parseInt(value)
        }
        this.requestUpdateRealizadoQuantidade(request)
    }

    componentWillMount(){
        this.props.setPageTitle('Marcenaria')
        this.requestGetProducaoAcompanhamento(this.props.session.perfil.idSetor)
    }

    componentDidMount(){
        this.props.form.setFieldsValue({
            dataProducao: moment()
        })
        this.setState({dataProducao: moment().format('YYYY-MM-DD')})
    }

    componentDidUpdate(){
        if((this.state.tryToSetValues === true)){
            this.setRealizadoQuantidadeValues()
            this.setState({tryToSetValues: false})
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form
        console.log('this.props.producaoAcompanhamento', this.props.producaoAcompanhamento)
        var rows = null
        if(this.props.producaoAcompanhamento.length > 0){
            rows = this.props.producaoAcompanhamento[0].producoes
            .filter(producao => {
                return (producao.dataInicial === this.state.dataProducao)
            })
            .map(producao => {
                return(
                    <React.Fragment key={producao.id}>
                        <Row style={{backgroundColor: '#1890ff', color: '#fff'}}>
                            <Col xs={24} align="middle" style={{color: '#fff', fontSize: 16, fontWeight: 600}}>
                                {producao.nome}
                            </Col>
                        </Row>
                        {
                            producao.produtos.map(produto => {
                                return(
                                    <React.Fragment key={produto.id}>
                                        <Row style={{marginTop: 10, backgroundColor: '#f0f2f5'}}>
                                            <Col xs={24} align="begining" style={{fontSize: 14, fontWeight: 500}}>
                                                {produto.nome}
                                            </Col>
                                        </Row>
                                        {
                                            produto.subprodutos.map(subproduto => {
                                                return(
                                                    <React.Fragment key={subproduto.id}>
                                                        <Row type="flex" justfify="center" align="middle" style={{paddingTop: 10}}>
                                                            <Col xs={12} style={{fontWeight: 500}}>
                                                                {subproduto.nome}
                                                            </Col>
                                                            <Col xs={12} align="middle">
                                                                <Row>
                                                                    <Col xs={8}>
                                                                        <Button className="buttonRed" style={{width: '44px'}} onClick={() => this.handleQuantityChangeClick('sub', 'realizadoQuantidade_'+subproduto.idAcompanhamento)} align="middle"><Icon type="minus" /></Button>
                                                                    </Col>
                                                                    <Col xs={8}>
                                                                        <Form.Item style={{marginBottom: 0}}>
                                                                            {getFieldDecorator(`realizadoQuantidade_${subproduto.idAcompanhamento}`)(
                                                                                
                                                                                <Input
                                                                                    onChange={this.handleChangeQuantidadeRealizado}
                                                                                    style={{width: '90%', textAlign: 'center'}}
                                                                                />
                                                                            )}
                                                                        </Form.Item>
                                                                    </Col>
                                                                    <Col xs={8}>
                                                                        <Button type="primary" style={{width: '44px'}} onClick={() => this.handleQuantityChangeClick('add', 'realizadoQuantidade_'+subproduto.idAcompanhamento)}><Icon type="plus" /></Button>
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                        </Row>
                                                        <Row type="flex" justfify="center" align="middle" style={{marginBottom: 10, backgroundColor: '#f0f2f5'}}>
                                                            <Col xs={24} align="end" style={{padding: '0 5px 0 5px', fontWeight: 500}}>
                                                                <span>Restantes: 10</span>
                                                                <span style={{marginLeft: 10}}>Total: {subproduto.totalQuantidade}</span>
                                                            </Col>
                                                        </Row>
                                                    </React.Fragment>
                                                )
                                            })
                                        }
                                    </React.Fragment>
                                )
                            })
                        }
                    </React.Fragment>
                )
            })
        }

        return (
            <Form layout="vertical">
                <Row>
                    <Col xs={24} id="colData">
                        <Form.Item
                            label="Data"
                        >
                            {getFieldDecorator('dataProducao')(
                                <DatePicker
                                    locale={ptBr}
                                    format="DD/MM/YYYY"
                                    placeholder="Selecione a data"
                                    style={ {width: '100%'} }
                                    getCalendarContainer={() => document.getElementById('colData')}
                                    onChange={this.handleChangeDataProducao}
                                />
                            )}
                        </Form.Item>
                    </Col>
                </Row>
                {rows}
            </Form>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint,
        session: state.session,
        producaoAcompanhamento: state.producaoAcompanhamento
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) },
        setProducaoAcompanhamento: (producaoAcompanhamento) => { dispatch({ type: 'SET_PRODUCAOACOMPANHAMENTO', producaoAcompanhamento }) }
    }
}
 
export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(ProducaoLancamento))